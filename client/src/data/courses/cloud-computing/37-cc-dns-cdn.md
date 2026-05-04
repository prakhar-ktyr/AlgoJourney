---
title: "DNS and CDN in the Cloud"
---

# DNS and CDN in the Cloud

Every time you type a website address in your browser, a complex **DNS (Domain Name System)** lookup happens behind the scenes. And every time a page loads quickly with images and scripts — a **CDN (Content Delivery Network)** is likely involved.

In this lesson, you'll learn how DNS works, how cloud DNS services add intelligent routing, and how CDNs accelerate content delivery worldwide.

---

## Part 1: DNS Fundamentals

### What Is DNS?

DNS is the **phone book of the internet**. It translates human-readable domain names into IP addresses that computers use to communicate.

```
You type:    www.example.com
DNS returns:  93.184.216.34
Browser connects to: 93.184.216.34
```

Without DNS, you'd have to memorize IP addresses for every website!

---

## DNS Record Types

DNS stores different types of records, each serving a specific purpose:

| Record Type | Purpose | Example |
|-------------|---------|---------|
| **A** | Maps domain to IPv4 address | `example.com → 93.184.216.34` |
| **AAAA** | Maps domain to IPv6 address | `example.com → 2606:2800:220:1:...` |
| **CNAME** | Alias — points to another domain name | `www.example.com → example.com` |
| **MX** | Mail server for the domain | `example.com → mail.example.com (priority 10)` |
| **TXT** | Text data (verification, SPF, DKIM) | `example.com → "v=spf1 include:_spf.google.com"` |
| **NS** | Name servers for the domain | `example.com → ns1.awsdns.com` |
| **SOA** | Start of Authority — primary DNS info | Zone serial number, refresh intervals |
| **SRV** | Service location (host + port) | `_sip._tcp.example.com → sipserver.example.com:5060` |
| **PTR** | Reverse DNS — IP to domain | `34.216.184.93 → example.com` |
| **CAA** | Certificate Authority Authorization | `example.com → 0 issue "letsencrypt.org"` |

### Record Examples in Zone File Format

```dns
; A Records
example.com.        300  IN  A      93.184.216.34
api.example.com.    300  IN  A      10.0.1.50

; AAAA Record
example.com.        300  IN  AAAA   2606:2800:220:1:248:1893:25c8:1946

; CNAME Records
www.example.com.    300  IN  CNAME  example.com.
blog.example.com.   300  IN  CNAME  mysite.wordpress.com.

; MX Records (lower number = higher priority)
example.com.        300  IN  MX     10  mail1.example.com.
example.com.        300  IN  MX     20  mail2.example.com.

; TXT Records
example.com.        300  IN  TXT    "v=spf1 include:_spf.google.com ~all"

; NS Records
example.com.        86400 IN NS    ns1.awsdns-01.com.
example.com.        86400 IN NS    ns2.awsdns-02.net.
```

### Important Rules

- **A CNAME cannot coexist** with other records at the same name (the zone apex)
- You **cannot** use a CNAME at the root domain (`example.com`) — only subdomains
- Cloud providers offer **Alias records** (AWS) or **flattened CNAME** (Cloudflare) to work around this

---

## DNS Resolution Process

When you visit `www.example.com`, here's what happens step by step:

```
Your Browser
     │
     ▼
1. Check browser DNS cache
     │ (miss)
     ▼
2. Check OS DNS cache
     │ (miss)
     ▼
3. Query Recursive Resolver (your ISP or 8.8.8.8)
     │ (miss)
     ▼
4. Query Root Name Server (.)
     │ returns: "Ask .com TLD server"
     ▼
5. Query TLD Name Server (.com)
     │ returns: "Ask ns1.awsdns.com"
     ▼
6. Query Authoritative Name Server (ns1.awsdns.com)
     │ returns: "93.184.216.34"
     ▼
7. Recursive resolver caches the result
     │
     ▼
8. Browser connects to 93.184.216.34
```

### TTL (Time to Live)

Each DNS record has a **TTL** value — how long (in seconds) the result should be cached:

| TTL Value | Duration | Use Case |
|-----------|----------|----------|
| 60 | 1 minute | Records that change frequently (failover) |
| 300 | 5 minutes | Standard web applications |
| 3600 | 1 hour | Stable records |
| 86400 | 24 hours | NS records, rarely changing values |

```
Lower TTL = Faster propagation of changes, more DNS queries (higher cost)
Higher TTL = Slower propagation, fewer queries (lower cost)
```

> **Pro tip:** Before a migration, lower your TTL to 60 seconds a day in advance. After the migration, raise it back.

---

## Cloud DNS Services

### AWS Route 53

Amazon's DNS service, named after the DNS port number (53).

**Key features:**
- Hosted zones (public and private)
- Health checks and failover
- Domain registration
- Advanced routing policies
- 100% availability SLA

```
Hosted Zone: example.com
├── A Record:     example.com → ALB-123456.us-east-1.elb.amazonaws.com (Alias)
├── A Record:     api.example.com → 10.0.1.50
├── CNAME Record: www.example.com → example.com
├── MX Record:    example.com → 10 inbound-smtp.us-east-1.amazonaws.com
└── TXT Record:   example.com → "v=spf1 include:amazonses.com ~all"
```

### Azure DNS

```
DNS Zone: example.com
├── A Record:     example.com → Azure Front Door (Alias)
├── A Record:     api.example.com → 10.0.1.50
└── CNAME Record: www.example.com → example.azurewebsites.net
```

### Google Cloud DNS

```
Managed Zone: example-com
├── A Record:     example.com → 34.120.1.1
├── CNAME Record: www.example.com → example.com.
└── MX Record:    example.com → 10 smtp.google.com.
```

### Comparison

| Feature | Route 53 | Azure DNS | Cloud DNS |
|---------|----------|-----------|-----------|
| Hosted zone cost | $0.50/month | $0.50/month | $0.20/month |
| Query cost | $0.40/million | $0.40/million | $0.40/million |
| Health checks | Yes (extra cost) | Via Traffic Manager | Via Cloud Monitoring |
| Domain registration | Yes | No | Yes |
| Private zones | Yes | Yes | Yes |
| DNSSEC | Yes | No (preview) | Yes |

---

## DNS Routing Policies

Cloud DNS services offer intelligent routing that goes far beyond simple A records.

### 1. Simple Routing

Returns a single value. The most basic routing.

```
example.com → 93.184.216.34
```

### 2. Weighted Routing

Distribute traffic by weight. Great for blue-green deployments or A/B testing.

```
example.com:
  → 70% traffic → v2.example.com (new version)
  → 30% traffic → v1.example.com (old version)
```

```
Record 1: example.com → 10.0.1.10  (weight: 70)
Record 2: example.com → 10.0.2.10  (weight: 30)
```

### 3. Latency-Based Routing

Routes users to the region with the lowest latency.

```
User in Tokyo     → ap-northeast-1 (closest)
User in London    → eu-west-1 (closest)
User in New York  → us-east-1 (closest)
```

### 4. Failover Routing

Routes traffic to a standby resource when the primary fails a health check.

```
Primary (health check: HEALTHY)   → production-server
Secondary (if primary UNHEALTHY)  → static-s3-website (sorry page)
```

### 5. Geolocation Routing

Routes based on the user's geographic location (country, continent).

```
Users in EU       → eu-west-1 (GDPR-compliant servers)
Users in China    → cn-north-1 (local infrastructure)
Users everywhere  → us-east-1 (default)
```

### 6. Multi-Value Answer Routing

Returns multiple healthy IPs — like simple round-robin with health checks.

```
example.com →
  10.0.1.10 (healthy ✓)
  10.0.2.10 (healthy ✓)
  10.0.3.10 (unhealthy ✗ — excluded)
```

### Routing Policy Comparison

| Policy | Best For | Health Checks |
|--------|----------|---------------|
| Simple | Single resource | No |
| Weighted | Gradual deployments, A/B testing | Optional |
| Latency | Global apps, minimize latency | Optional |
| Failover | Disaster recovery, active-passive | Required |
| Geolocation | Compliance, localized content | Optional |
| Multi-Value | Simple load distribution | Yes |

---

## Part 2: CDN Concepts

### What Is a CDN?

A **Content Delivery Network** is a globally distributed network of servers that caches and delivers content from locations **close to the user**.

```
Without CDN:
  User in Sydney → Server in Virginia (200ms latency)

With CDN:
  User in Sydney → Edge in Sydney (10ms latency)
```

### How a CDN Works

```
1. User requests image.jpg
      │
      ▼
2. Request goes to nearest Edge Location
      │
      ├── Cache HIT → Return cached image (fast!)
      │
      └── Cache MISS
            │
            ▼
      3. Edge fetches from Origin Server
            │
            ▼
      4. Edge caches the response
            │
            ▼
      5. Edge returns image to user
            │
            ▼
      6. Next request = Cache HIT (fast!)
```

### Key CDN Terms

| Term | Definition |
|------|------------|
| **Edge Location** | A server/data center close to end users (AWS has 400+ globally) |
| **Origin** | The original source of content (S3 bucket, web server, ALB) |
| **Cache Hit** | Content found in edge cache — served immediately |
| **Cache Miss** | Content not cached — fetched from origin, then cached |
| **TTL** | How long content stays cached at the edge |
| **Cache Invalidation** | Forcing the CDN to remove cached content |
| **Distribution** | A CDN configuration (what origin, what behaviors, what domain) |

---

## Cache Invalidation Strategies

One of the hardest problems in CDN management: **how do you update cached content?**

### Strategy 1: Cache Busting with Versioned URLs

Append a version or hash to the filename:

```
Before: /static/app.js
After:  /static/app.a1b2c3d4.js

When you deploy new code, the filename changes → CDN fetches the new version.
```

**This is the recommended approach.** Build tools like Webpack and Vite do this automatically.

### Strategy 2: Invalidation API

Tell the CDN to purge specific paths:

```bash
# AWS CloudFront invalidation
aws cloudfront create-invalidation \
  --distribution-id E1234567890 \
  --paths "/index.html" "/api/*"
```

| Consideration | Details |
|---------------|---------|
| Cost | First 1,000 paths/month free, then $0.005 per path |
| Speed | Takes 1–15 minutes to propagate globally |
| Wildcard | Supported (`/images/*`) but counts as one path |

### Strategy 3: Short TTLs

Set low TTL values for frequently changing content:

```
Static assets (JS, CSS, images):  TTL = 1 year (versioned filenames)
HTML pages:                        TTL = 5 minutes
API responses:                     TTL = 0 (no caching) or 60 seconds
```

---

## Cloud CDN Services

### AWS CloudFront

```
CloudFront Distribution:
├── Origins:
│   ├── S3 Bucket (static assets)
│   └── ALB (API server)
├── Behaviors:
│   ├── /static/* → S3 Origin (cache 1 year)
│   ├── /api/*    → ALB Origin (no cache)
│   └── Default   → S3 Origin (cache 1 day)
├── Domain: d1234567890.cloudfront.net
├── SSL: ACM certificate for cdn.example.com
└── Edge Locations: 400+ globally
```

**CloudFront configuration (Terraform):**

```hcl
resource "aws_cloudfront_distribution" "cdn" {
  enabled             = true
  default_root_object = "index.html"
  aliases             = ["cdn.example.com"]
  price_class         = "PriceClass_100"  # US, Canada, Europe only

  origin {
    domain_name = aws_s3_bucket.static.bucket_regional_domain_name
    origin_id   = "s3-static"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  origin {
    domain_name = aws_lb.api.dns_name
    origin_id   = "alb-api"

    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  default_cache_behavior {
    target_origin_id       = "s3-static"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    min_ttl     = 0
    default_ttl = 86400
    max_ttl     = 31536000
  }

  ordered_cache_behavior {
    path_pattern           = "/api/*"
    target_origin_id       = "alb-api"
    viewer_protocol_policy = "https-only"
    allowed_methods        = ["GET", "HEAD", "OPTIONS", "PUT", "POST", "PATCH", "DELETE"]
    cached_methods         = ["GET", "HEAD"]

    forwarded_values {
      query_string = true
      headers      = ["Authorization", "Origin"]
      cookies {
        forward = "all"
      }
    }

    min_ttl     = 0
    default_ttl = 0
    max_ttl     = 0
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate.cert.arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }
}
```

### Azure CDN

| Profile Type | Best For |
|-------------|----------|
| Azure Front Door | Global load balancing + CDN |
| Azure CDN Standard from Microsoft | Basic CDN needs |
| Azure CDN from Akamai | Premium features |
| Azure CDN from Verizon | Advanced rules engine |

### Google Cloud CDN

- Tightly integrated with Cloud Load Balancing
- Supports Cloud Storage and Compute Engine as origins
- Automatic cache key optimization

### CDN Comparison

| Feature | CloudFront | Azure CDN | Cloud CDN |
|---------|-----------|-----------|-----------|
| Edge locations | 400+ | 100+ | 100+ |
| Free SSL | Yes (ACM) | Yes | Yes (managed) |
| WebSocket | Yes | Yes | No |
| HTTP/3 | Yes | Preview | Yes |
| Real-time logs | Yes | Yes | Yes |
| Price class | 3 tiers | Varies by provider | Single tier |

---

## CDN Configuration Best Practices

### 1. Set Proper Cache Headers

Your origin server should send appropriate cache headers:

```
# Static assets (versioned filenames)
Cache-Control: public, max-age=31536000, immutable

# HTML pages
Cache-Control: public, max-age=300, s-maxage=3600

# API responses (dynamic)
Cache-Control: no-store

# Private content (per-user)
Cache-Control: private, max-age=60
```

### 2. Enable Compression

CDNs can compress content at the edge:

```
Supported formats:
  - gzip  (widely supported)
  - Brotli (20-30% smaller than gzip)

Compress these content types:
  - text/html
  - text/css
  - application/javascript
  - application/json
  - image/svg+xml
```

### 3. Use HTTPS Everywhere

```
Viewer → Edge:     HTTPS (redirect HTTP to HTTPS)
Edge → Origin:     HTTPS (origin protocol policy)
Certificate:       Managed SSL from the CDN provider
TLS Version:       1.2 minimum (disable 1.0 and 1.1)
```

---

## Performance Optimization

### Measuring CDN Performance

Use these headers to debug CDN behavior:

```http
HTTP/1.1 200 OK
X-Cache: Hit from cloudfront        ← Cache HIT
X-Cache: Miss from cloudfront       ← Cache MISS (fetched from origin)
Age: 3600                           ← Seconds since cached
Via: 1.1 abc123.cloudfront.net      ← CDN edge that served the request
X-Amz-Cf-Pop: SFO5-C3              ← Edge location (San Francisco)
```

### Cache Hit Ratio

Aim for a **cache hit ratio above 90%**:

```
Cache Hit Ratio = Cache Hits / Total Requests × 100

Below 80%: Review cache settings, check query strings, headers
80-90%:    Good for dynamic sites
90-95%:    Good for most sites
95%+:      Excellent — mostly static content
```

### Tips to Improve Cache Hit Ratio

| Problem | Solution |
|---------|----------|
| Query strings vary | Normalize or ignore query string order |
| Cookies forwarded | Only forward cookies for paths that need them |
| Too many origins | Consolidate static assets to fewer origins |
| Short TTLs | Increase TTLs where possible |
| Headers vary | Forward only necessary headers |

---

## Cost Considerations

### DNS Costs

| Component | AWS Route 53 | Azure DNS | Cloud DNS |
|-----------|-------------|-----------|-----------|
| Hosted zone | $0.50/month | $0.50/month | $0.20/month |
| Standard queries | $0.40/million | $0.40/million | $0.40/million |
| Latency queries | $0.60/million | N/A (via Traffic Manager) | N/A |
| Health checks | $0.50–$2.00/month each | Included in Traffic Manager | Included |

### CDN Costs

```
CloudFront pricing (US/Europe):
  First 10 TB:     $0.085/GB
  Next 40 TB:      $0.080/GB
  Invalidations:   First 1,000 free, then $0.005 each
  HTTPS requests:  $0.01 per 10,000

Cost optimization strategies:
  1. Use Price Class 100 (US + Europe) if traffic is regional
  2. Compress assets (reduce data transfer by 50-70%)
  3. Set long TTLs on static assets
  4. Use versioned URLs instead of invalidations
  5. Monitor data transfer patterns
```

---

## Exercises

### Exercise 1: DNS Record Setup

You're setting up DNS for `myshop.com`. Create the necessary records for:
- Main website hosted on an ALB
- Blog at `blog.myshop.com` hosted on WordPress.com
- Email through Google Workspace
- SPF record to prevent email spoofing

<details>
<summary>Solution</summary>

```dns
; Website — Alias/A record to ALB
myshop.com.          300  IN  A      ALIAS alb-123.us-east-1.elb.amazonaws.com

; Blog — CNAME to WordPress
blog.myshop.com.     300  IN  CNAME  myshop.wordpress.com.

; Email — MX records for Google Workspace
myshop.com.          3600 IN  MX     1   aspmx.l.google.com.
myshop.com.          3600 IN  MX     5   alt1.aspmx.l.google.com.
myshop.com.          3600 IN  MX     5   alt2.aspmx.l.google.com.

; SPF — TXT record
myshop.com.          3600 IN  TXT    "v=spf1 include:_spf.google.com ~all"
```

</details>

### Exercise 2: CDN Behavior Design

Design CDN cache behaviors for an e-commerce site with:
- Static assets (`/static/*`) — images, JS, CSS
- Product pages (`/products/*`) — change daily
- Shopping cart API (`/api/cart/*`) — must not cache
- User-specific content (`/account/*`) — private

<details>
<summary>Solution</summary>

```
Behavior 1: /static/*
  Origin: S3 Bucket
  TTL: 1 year (31536000 seconds)
  Forward: Nothing (no cookies, no query strings)
  Compression: Yes (gzip + Brotli)
  Headers: Cache-Control: public, max-age=31536000, immutable

Behavior 2: /products/*
  Origin: ALB
  TTL: 1 day (86400 seconds)
  Forward: Query strings (for ?color=red, etc.)
  Compression: Yes
  Headers: Cache-Control: public, max-age=86400, s-maxage=86400

Behavior 3: /api/cart/*
  Origin: ALB
  TTL: 0 (no caching)
  Forward: All cookies, all headers, all query strings
  Compression: No
  Headers: Cache-Control: no-store

Behavior 4: /account/*
  Origin: ALB
  TTL: 0 (no caching at CDN)
  Forward: All cookies (session), Authorization header
  Compression: Yes
  Headers: Cache-Control: private, no-store
```

</details>

### Exercise 3: Routing Policy

Your app runs in `us-east-1` (primary) and `eu-west-1` (secondary). Design a Route 53 configuration that:
1. Routes European users to `eu-west-1`
2. Routes everyone else to `us-east-1`
3. Fails over to the other region if one is unhealthy

<details>
<summary>Solution</summary>

Use a **combination of Geolocation and Failover routing**:

```
Step 1: Create health checks
  - Health Check A: us-east-1 ALB (HTTP 200 on /health)
  - Health Check B: eu-west-1 ALB (HTTP 200 on /health)

Step 2: Create Geolocation records with failover
  Record 1 (Europe):
    Type: Geolocation
    Location: Europe
    Primary:   eu-west-1 ALB (failover: Health Check B)
    Secondary: us-east-1 ALB (failover target)

  Record 2 (Default — everyone else):
    Type: Geolocation
    Location: Default
    Primary:   us-east-1 ALB (failover: Health Check A)
    Secondary: eu-west-1 ALB (failover target)
```

This ensures European users go to `eu-west-1` normally, but fail over to `us-east-1` if the EU region is unhealthy (and vice versa).

</details>

---

## Key Takeaways

| Concept | Remember |
|---------|----------|
| **DNS** | Translates domain names to IP addresses |
| **A record** | Maps domain → IPv4; AAAA maps → IPv6 |
| **CNAME** | Alias to another domain name (not at zone apex) |
| **TTL** | Lower = faster updates, more queries; higher = fewer queries |
| **Routing policies** | Simple, weighted, latency, failover, geolocation |
| **CDN** | Caches content at edge locations near users |
| **Cache hit ratio** | Aim above 90% — optimize headers, TTLs, and forwarding |
| **Cache busting** | Use versioned filenames instead of invalidation APIs |
| **HTTPS** | Always encrypt viewer ↔ edge and edge ↔ origin |
| **Cost** | Compress content, use regional price classes, set proper TTLs |

---

## What's Next?

In the next lesson, you'll learn about **Cloud Storage Types** — block, object, and file storage — and how to choose the right storage service for your workloads.
