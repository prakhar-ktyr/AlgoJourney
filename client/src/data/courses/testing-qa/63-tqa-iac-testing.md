---
title: Infrastructure as Code Testing
---

## What is Infrastructure as Code?

Infrastructure as Code (IaC) is the practice of managing and provisioning infrastructure through machine-readable configuration files rather than manual processes. IaC enables version control, repeatability, and testability for your infrastructure.

### Popular IaC Tools

| Tool | Provider | Language | State Management |
|------|----------|----------|-----------------|
| Terraform | HashiCorp | HCL | State file (local/remote) |
| Pulumi | Pulumi | Python, JS, Go, C# | Pulumi Cloud/self-managed |
| CloudFormation | AWS | JSON/YAML | AWS-managed |
| Bicep | Microsoft | Bicep DSL | Azure Resource Manager |

### Why Test Infrastructure Code?

- **Prevent outages**: Catch misconfigurations before deployment
- **Security compliance**: Ensure resources meet security policies
- **Cost control**: Detect expensive resource configurations
- **Drift prevention**: Verify actual state matches desired state
- **Confidence in changes**: Refactor infrastructure safely

---

## Static Analysis for IaC

Static analysis examines infrastructure code without deploying it, catching errors early in the development cycle.

### tflint (Terraform)

tflint detects errors, deprecated syntax, and enforces best practices in Terraform configurations:

```hcl
# .tflint.hcl configuration
plugin "aws" {
  enabled = true
  version = "0.27.0"
  source  = "github.com/terraform-linters/tflint-ruleset-aws"
}

rule "terraform_naming_convention" {
  enabled = true
  format  = "snake_case"
}
```

### Checkov (Multi-tool)

Checkov scans IaC files for security misconfigurations across Terraform, CloudFormation, Kubernetes, and more:

```bash
# Run checkov against Terraform directory
checkov -d ./terraform --framework terraform

# Run against CloudFormation template
checkov -f template.yaml --framework cloudformation

# Custom policy check
checkov -d . --external-checks-dir ./custom_policies
```

### cfn-lint (CloudFormation)

cfn-lint validates CloudFormation templates against the AWS resource specification:

```bash
# Validate a CloudFormation template
cfn-lint validate template.yaml

# Check with specific rules
cfn-lint -t template.yaml -a cfn_lint_serverless.rules
```

---

## Unit Testing IaC

Unit tests for infrastructure verify that your code produces the expected resource configurations without actually deploying anything.

### Terratest (Go)

Terratest is a Go library that provides patterns and helper functions for testing infrastructure:

```go
package test

import (
    "testing"
    "github.com/gruntwork-io/terratest/modules/terraform"
    "github.com/stretchr/testify/assert"
)

func TestTerraformVPC(t *testing.T) {
    t.Parallel()

    terraformOptions := terraform.WithDefaultRetryableErrors(t, &terraform.Options{
        TerraformDir: "../modules/vpc",
        Vars: map[string]interface{}{
            "vpc_cidr":     "10.0.0.0/16",
            "environment":  "test",
            "subnet_count": 3,
        },
    })

    defer terraform.Destroy(t, terraformOptions)
    terraform.InitAndApply(t, terraformOptions)

    vpcId := terraform.Output(t, terraformOptions, "vpc_id")
    assert.NotEmpty(t, vpcId)

    subnetIds := terraform.OutputList(t, terraformOptions, "subnet_ids")
    assert.Equal(t, 3, len(subnetIds))
}
```

### Pulumi Test Framework

Pulumi provides native testing support in multiple languages, allowing you to mock cloud providers and verify resource properties.

### CDK Assertions (AWS)

AWS CDK includes assertion libraries for testing synthesized CloudFormation templates without deployment.

---

## Unit Testing with Pulumi (Python)

```python
import pulumi
import pulumi.runtime
from unittest.mock import MagicMock
import pytest


class MockedMounts:
    """Mock Pulumi resource creation for unit testing."""

    def __init__(self):
        self.resources = []

    def register_resource(self, resource_type, name, inputs, opts=None):
        self.resources.append({
            "type": resource_type,
            "name": name,
            "inputs": inputs,
        })
        return {
            "id": f"mock-{name}-id",
            "state": inputs,
        }


@pytest.fixture
def pulumi_mocks():
    """Set up Pulumi mocks for testing."""
    mocks = MockedMounts()
    pulumi.runtime.set_mocks(mocks)
    return mocks


def test_s3_bucket_has_versioning(pulumi_mocks):
    """Test that S3 bucket is created with versioning enabled."""
    import my_infra.storage as storage

    def check_bucket(args):
        bucket_config = args[0]
        assert bucket_config.get("versioning") is not None
        versioning = bucket_config["versioning"]
        assert versioning.get("enabled") is True
        return True

    pulumi.Output.all(storage.bucket.versioning).apply(check_bucket)


def test_security_group_restricts_ingress(pulumi_mocks):
    """Test that security groups don't allow unrestricted ingress."""
    import my_infra.networking as networking

    def check_sg(args):
        ingress_rules = args[0]
        for rule in ingress_rules:
            assert rule.get("cidr_blocks") != ["0.0.0.0/0"], (
                "Security group should not allow unrestricted ingress"
            )
        return True

    pulumi.Output.all(networking.sg.ingress).apply(check_sg)


def test_rds_instance_encrypted(pulumi_mocks):
    """Test that RDS instance has encryption enabled."""
    import my_infra.database as database

    def check_rds(args):
        storage_encrypted = args[0]
        assert storage_encrypted is True, "RDS must have storage encryption"
        return True

    pulumi.Output.all(database.rds.storage_encrypted).apply(check_rds)


def test_vpc_configuration(pulumi_mocks):
    """Test VPC is configured with correct CIDR and tags."""
    import my_infra.networking as networking

    def check_vpc(args):
        cidr, tags = args
        assert cidr == "10.0.0.0/16"
        assert "Environment" in tags
        assert tags["Environment"] in ["dev", "staging", "production"]
        return True

    pulumi.Output.all(
        networking.vpc.cidr_block,
        networking.vpc.tags,
    ).apply(check_vpc)
```

## Unit Testing with CDK Assertions (JavaScript)

```javascript
const { Template, Match } = require("aws-cdk-lib/assertions");
const { App, Stack } = require("aws-cdk-lib");
const { NetworkStack } = require("../lib/network-stack");
const { DatabaseStack } = require("../lib/database-stack");
const { ComputeStack } = require("../lib/compute-stack");

describe("NetworkStack", () => {
  let template;

  beforeAll(() => {
    const app = new App();
    const stack = new NetworkStack(app, "TestNetworkStack", {
      env: { account: "123456789012", region: "us-east-1" },
      vpcCidr: "10.0.0.0/16",
      maxAzs: 3,
    });
    template = Template.fromStack(stack);
  });

  test("creates VPC with correct CIDR", () => {
    template.hasResourceProperties("AWS::EC2::VPC", {
      CidrBlock: "10.0.0.0/16",
      EnableDnsHostnames: true,
      EnableDnsSupport: true,
    });
  });

  test("creates public and private subnets", () => {
    template.resourceCountIs("AWS::EC2::Subnet", 6);

    template.hasResourceProperties("AWS::EC2::Subnet", {
      MapPublicIpOnLaunch: true,
      Tags: Match.arrayWith([
        Match.objectLike({ Key: "SubnetType", Value: "Public" }),
      ]),
    });
  });

  test("creates NAT gateway for private subnets", () => {
    template.resourceCountIs("AWS::EC2::NatGateway", 3);
  });

  test("security group restricts SSH access", () => {
    template.hasResourceProperties("AWS::EC2::SecurityGroup", {
      SecurityGroupIngress: Match.not(
        Match.arrayWith([
          Match.objectLike({
            IpProtocol: "tcp",
            FromPort: 22,
            CidrIp: "0.0.0.0/0",
          }),
        ])
      ),
    });
  });
});

describe("DatabaseStack", () => {
  let template;

  beforeAll(() => {
    const app = new App();
    const stack = new DatabaseStack(app, "TestDatabaseStack", {
      instanceType: "db.t3.medium",
      multiAz: true,
    });
    template = Template.fromStack(stack);
  });

  test("RDS instance has encryption enabled", () => {
    template.hasResourceProperties("AWS::RDS::DBInstance", {
      StorageEncrypted: true,
      MultiAZ: true,
    });
  });

  test("RDS has automated backups configured", () => {
    template.hasResourceProperties("AWS::RDS::DBInstance", {
      BackupRetentionPeriod: Match.anyValue(),
      DeletionProtection: true,
    });
  });

  test("creates read replica for production", () => {
    template.hasResource("AWS::RDS::DBInstance", {
      Properties: Match.objectLike({
        SourceDBInstanceIdentifier: Match.anyValue(),
      }),
    });
  });
});
```

## Unit Testing CloudFormation Concepts (Java)

```java
package com.example.iac.testing;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import static org.junit.jupiter.api.Assertions.*;

import java.util.Map;
import java.util.List;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;

/**
 * Unit tests for CloudFormation template validation.
 * These tests parse and validate template structure
 * without deploying to AWS.
 */
public class CloudFormationTemplateTest {

    private ObjectMapper objectMapper;
    private JsonNode template;

    @BeforeEach
    void setUp() throws Exception {
        objectMapper = new ObjectMapper();
        template = objectMapper.readTree(
            getClass().getResourceAsStream("/templates/main-stack.json")
        );
    }

    @Test
    @DisplayName("Template has required sections")
    void templateHasRequiredSections() {
        assertNotNull(template.get("AWSTemplateFormatVersion"));
        assertNotNull(template.get("Description"));
        assertNotNull(template.get("Resources"));
        assertNotNull(template.get("Outputs"));
    }

    @Test
    @DisplayName("S3 bucket has encryption configured")
    void s3BucketHasEncryption() {
        JsonNode resources = template.get("Resources");
        resources.fields().forEachRemaining(entry -> {
            JsonNode resource = entry.getValue();
            if ("AWS::S3::Bucket".equals(resource.get("Type").asText())) {
                JsonNode properties = resource.get("Properties");
                assertNotNull(
                    properties.get("BucketEncryption"),
                    "S3 bucket " + entry.getKey() + " must have encryption"
                );
                JsonNode rules = properties
                    .get("BucketEncryption")
                    .get("ServerSideEncryptionConfiguration");
                assertTrue(rules.isArray() && rules.size() > 0);
            }
        });
    }

    @Test
    @DisplayName("Security groups do not allow 0.0.0.0/0 on SSH")
    void securityGroupsRestrictSSH() {
        JsonNode resources = template.get("Resources");
        resources.fields().forEachRemaining(entry -> {
            JsonNode resource = entry.getValue();
            if ("AWS::EC2::SecurityGroup".equals(
                    resource.get("Type").asText())) {
                JsonNode ingress = resource
                    .get("Properties")
                    .get("SecurityGroupIngress");
                if (ingress != null && ingress.isArray()) {
                    for (JsonNode rule : ingress) {
                        if (rule.get("FromPort").asInt() == 22) {
                            assertNotEquals(
                                "0.0.0.0/0",
                                rule.get("CidrIp").asText(),
                                "SSH must not be open to the world"
                            );
                        }
                    }
                }
            }
        });
    }

    @Test
    @DisplayName("All IAM roles have least privilege policies")
    void iamRolesHaveLeastPrivilege() {
        JsonNode resources = template.get("Resources");
        resources.fields().forEachRemaining(entry -> {
            JsonNode resource = entry.getValue();
            if ("AWS::IAM::Role".equals(resource.get("Type").asText())) {
                JsonNode policies = resource
                    .get("Properties")
                    .get("Policies");
                if (policies != null) {
                    for (JsonNode policy : policies) {
                        JsonNode statements = policy
                            .get("PolicyDocument")
                            .get("Statement");
                        for (JsonNode stmt : statements) {
                            String action = stmt.get("Action").asText();
                            assertNotEquals(
                                "*", action,
                                "IAM role " + entry.getKey()
                                    + " uses wildcard action"
                            );
                        }
                    }
                }
            }
        });
    }
}
```

## IaC Testing with Pulumi/Bicep (C#)

```csharp
using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Threading.Tasks;
using Pulumi;
using Pulumi.Testing;
using Xunit;

namespace InfraTests
{
    public class MockResourceMonitor : IMocks
    {
        public Task<(string? id, object state)> NewResourceAsync(
            MockResourceArgs args)
        {
            var outputs = new Dictionary<string, object>(
                args.Inputs);
            outputs["id"] = $"mock-{args.Name}-id";

            return Task.FromResult<(string?, object)>(
                ($"mock-{args.Name}-id", outputs));
        }

        public Task<object> CallAsync(MockCallArgs args)
        {
            return Task.FromResult<object>(args.Args);
        }
    }

    public class StorageAccountTests
    {
        [Fact]
        public async Task StorageAccountHasEncryption()
        {
            var resources = await Deployment.TestAsync<MyStack>(
                new MockResourceMonitor(),
                new TestOptions { IsPreview = false });

            var storageAccounts = resources
                .OfType<Pulumi.Azure.Storage.Account>();

            foreach (var account in storageAccounts)
            {
                var encryption = await account.EnableHttpsTrafficOnly
                    .GetValueAsync();
                Assert.True(encryption,
                    "Storage account must enforce HTTPS");
            }
        }

        [Fact]
        public async Task StorageAccountHasCorrectReplication()
        {
            var resources = await Deployment.TestAsync<MyStack>(
                new MockResourceMonitor(),
                new TestOptions { IsPreview = false });

            var storageAccounts = resources
                .OfType<Pulumi.Azure.Storage.Account>();

            foreach (var account in storageAccounts)
            {
                var replication = await account.AccountReplicationType
                    .GetValueAsync();
                Assert.Contains(replication,
                    new[] { "GRS", "RAGRS", "ZRS" });
            }
        }

        [Fact]
        public async Task VNetHasCorrectAddressSpace()
        {
            var resources = await Deployment.TestAsync<MyStack>(
                new MockResourceMonitor(),
                new TestOptions { IsPreview = false });

            var vnets = resources
                .OfType<Pulumi.Azure.Network.VirtualNetwork>();

            foreach (var vnet in vnets)
            {
                var addressSpaces = await vnet.AddressSpaces
                    .GetValueAsync();
                Assert.NotEmpty(addressSpaces);
                Assert.All(addressSpaces, space =>
                    Assert.Matches(@"^10\.\d+\.\d+\.\d+/\d+$", space));
            }
        }

        [Fact]
        public async Task AllResourcesHaveRequiredTags()
        {
            var resources = await Deployment.TestAsync<MyStack>(
                new MockResourceMonitor(),
                new TestOptions { IsPreview = false });

            var requiredTags = new[] {
                "Environment", "Team", "CostCenter"
            };

            foreach (var resource in resources)
            {
                var tagsProperty = resource.GetType()
                    .GetProperty("Tags");
                if (tagsProperty == null) continue;

                var tags = await ((Output<ImmutableDictionary<
                    string, string>?>)tagsProperty
                    .GetValue(resource)!).GetValueAsync();

                if (tags == null) continue;

                foreach (var requiredTag in requiredTags)
                {
                    Assert.True(tags.ContainsKey(requiredTag),
                        $"Resource {resource.GetResourceName()} " +
                        $"missing tag: {requiredTag}");
                }
            }
        }
    }
}
```

---

## Integration Testing IaC

Integration tests deploy infrastructure to an ephemeral environment, validate behavior, then tear everything down.

### Ephemeral Environment Strategy

1. **Create**: Deploy infrastructure to an isolated test environment
2. **Validate**: Run assertions against live resources
3. **Destroy**: Tear down all resources regardless of test outcome

### Best Practices for Integration Testing

- Use unique naming with random suffixes to avoid collisions
- Set short TTLs and auto-destroy mechanisms as safety nets
- Run in dedicated test accounts with billing alerts
- Parallelize independent resource tests
- Cache expensive operations (AMI lookups, DNS propagation)

---

## Policy as Code

Policy as code enforces organizational rules on infrastructure configurations before deployment.

### Open Policy Agent (OPA)

OPA uses Rego language to define policies that evaluate infrastructure plans:

```rego
# policy/terraform.rego
package terraform.analysis

import future.keywords.in

deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_s3_bucket"
    not resource.change.after.server_side_encryption_configuration
    msg := sprintf("S3 bucket '%s' must have encryption", [resource.name])
}

deny[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_security_group_rule"
    resource.change.after.cidr_blocks[_] == "0.0.0.0/0"
    resource.change.after.from_port == 22
    msg := sprintf("Security group '%s' allows SSH from anywhere",
        [resource.name])
}

warn[msg] {
    resource := input.resource_changes[_]
    resource.type == "aws_instance"
    not resource.change.after.tags.CostCenter
    msg := sprintf("Instance '%s' missing CostCenter tag", [resource.name])
}
```

### HashiCorp Sentinel

Sentinel is HashiCorp's policy-as-code framework integrated with Terraform Cloud:

```python
# sentinel/enforce-encryption.sentinel
import "tfplan/v2" as tfplan

s3_buckets = filter tfplan.resource_changes as _, rc {
    rc.type is "aws_s3_bucket" and
    rc.mode is "managed" and
    (rc.change.actions contains "create" or
     rc.change.actions contains "update")
}

encryption_enabled = rule {
    all s3_buckets as _, bucket {
        bucket.change.after.server_side_encryption_configuration
            is not null
    }
}

main = rule {
    encryption_enabled
}
```

---

## Drift Detection

Drift detection identifies differences between the desired state (defined in code) and the actual state of deployed infrastructure.

### Types of Drift

| Type | Description | Example |
|------|-------------|---------|
| Configuration drift | Resource properties changed | Security group rule added manually |
| Resource drift | Resources added/removed outside IaC | EC2 instance created via console |
| State drift | State file out of sync | Terraform state doesn't match reality |

### Detection Strategies

- **Scheduled plans**: Run `terraform plan` on a schedule to detect changes
- **Cloud provider APIs**: Query AWS Config, Azure Policy for compliance
- **Event-driven**: Monitor CloudTrail/Activity Log for manual changes
- **Reconciliation loops**: Kubernetes-style controllers that continuously reconcile

### Remediation Approaches

1. **Alert only**: Notify team of drift for manual review
2. **Auto-remediate**: Automatically apply IaC to restore desired state
3. **Import**: Bring manually-created resources under IaC management
4. **Destroy and recreate**: Remove drifted resources and redeploy

---

## Summary

Infrastructure as Code testing ensures your cloud resources are secure, compliant, and correctly configured:

- **Static analysis** catches issues without deploying (tflint, checkov, cfn-lint)
- **Unit tests** verify resource configurations in isolation (Pulumi tests, CDK assertions)
- **Integration tests** validate deployed infrastructure in ephemeral environments
- **Policy as code** enforces organizational standards (OPA, Sentinel)
- **Drift detection** monitors for unauthorized changes post-deployment

Testing IaC is critical because infrastructure failures can cascade into application outages, security breaches, and compliance violations.
