---
title: Python Virtual Environments
---

# Python Virtual Environments

A **virtual environment** ("venv") is an isolated Python installation. Each project gets its own copy of dependencies — no more `django==3` vs `django==4` conflicts. **Use a venv for every project from day one.**

## Creating a venv

The standard library's `venv` module does this:

```bash
python3 -m venv .venv
```

This creates a `.venv/` folder in the current directory, containing a private `bin/python`, `bin/pip`, and a place for installed packages. The folder name is convention; `.venv` and `venv` are both common.

## Activating

After creation, you need to **activate** the venv so `python` and `pip` refer to its copies.

```bash
# macOS / Linux  (bash, zsh)
source .venv/bin/activate

# Windows (PowerShell)
.venv\Scripts\Activate.ps1

# Windows (cmd.exe)
.venv\Scripts\activate.bat
```

After activation your shell prompt usually gains a `(.venv)` prefix:

```
(.venv) ~/projects/myapp $
```

Now `which python` (or `where python` on Windows) points inside `.venv/`. Anything `pip install`s lands in the venv only.

## Deactivating

```bash
deactivate
```

## A typical workflow

```bash
mkdir myapp && cd myapp
python3 -m venv .venv
source .venv/bin/activate

python3 -m pip install --upgrade pip
python3 -m pip install requests fastapi

# work on your project...

python3 -m pip freeze > requirements.txt
```

A teammate then clones your repo and:

```bash
cd myapp
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r requirements.txt
```

Identical environment in three commands.

## Always `.gitignore` the venv

The `.venv/` folder is large, machine-specific, and trivially recreated from `requirements.txt`. Add it to `.gitignore`:

```
.venv/
__pycache__/
*.pyc
```

Commit only the source code and `requirements.txt`.

## Choosing the Python version

`python3 -m venv` uses the Python you ran it with. To create a venv with a specific version, run that version's interpreter:

```bash
/usr/bin/python3.11 -m venv .venv         # Linux / macOS
py -3.11 -m venv .venv                     # Windows (the `py` launcher)
```

Tools like **`pyenv`** make it easy to install and switch between many Python versions on one machine.

## `pyproject.toml` — the modern alternative

For new projects, `pyproject.toml` is replacing `requirements.txt` + `setup.py`:

```toml
[project]
name = "myapp"
version = "0.1.0"
dependencies = [
    "requests>=2.31",
    "fastapi>=0.110",
]

[project.optional-dependencies]
dev = ["pytest", "ruff", "mypy"]
```

Install with `pip install -e .` (editable install of your current project). Tools like `poetry` and `uv` use `pyproject.toml` natively.

## `uv` — the fast all-in-one

[`uv`](https://github.com/astral-sh/uv) (from Astral, makers of `ruff`) is a modern Rust-based replacement for `pip`, `pip-tools`, and `venv`. It's 10–100× faster.

```bash
# install (one-time)
brew install uv          # or: pipx install uv, or curl -LsSf install script

# create a venv and install deps in one command
uv venv
uv pip install -r requirements.txt
```

If you're starting a fresh project today, give `uv` a serious look.

## Common pitfalls

- **Forgot to activate.** You install a package, then immediately get `ModuleNotFoundError`. Check whether the venv is activated (`which python`).
- **Activated, then opened a new terminal.** Activation is shell-session-scoped. New terminal → activate again.
- **Committed `.venv/` to Git.** Add it to `.gitignore`. Pull-request reviewers will not be amused.
- **Different OS, same venv.** A venv created on Linux won't work on Windows. Recreate from `requirements.txt`.

## Try it

```bash
mkdir scratch && cd scratch
python3 -m venv .venv
source .venv/bin/activate

python3 -m pip install cowsay
python3 -c "import cowsay; cowsay.cow('hello venv!')"

deactivate
rm -rf .venv          # safe to delete; just recreate when needed
```

You should see a friendly ASCII cow saying hello — and it lives entirely inside `.venv/`.
