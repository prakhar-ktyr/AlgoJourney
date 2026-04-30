---
title: Python pip & Packages
---

# Python pip & Packages

The Python standard library is huge — but PyPI (the Python Package Index) hosts hundreds of thousands of third-party packages. **`pip`** is the tool that downloads and installs them.

## Verifying pip

`pip` ships with Python. Check:

```bash
python3 -m pip --version
```

The `python3 -m pip ...` form is recommended over plain `pip` because it guarantees you're using the `pip` that goes with the Python you're using. Mismatched versions are a leading cause of "I installed the package but it says ModuleNotFoundError!" frustration.

## Installing a package

```bash
python3 -m pip install requests
```

You can now use it from any script run with the same Python:

```python
import requests
r = requests.get("https://api.github.com")
print(r.status_code)
```

## Specific versions

```bash
python3 -m pip install "django==4.2.7"        # exact
python3 -m pip install "django>=4.2,<5.0"     # range
python3 -m pip install "django~=4.2"          # compatible release: >=4.2, <5.0
```

Pinning versions is a best practice for reproducibility.

## Upgrading & uninstalling

```bash
python3 -m pip install --upgrade requests
python3 -m pip uninstall requests
```

## Listing what's installed

```bash
python3 -m pip list
python3 -m pip show requests       # details about one package
python3 -m pip freeze              # exact pinned versions, suitable for requirements.txt
```

## `requirements.txt` — the simple lock file

Capture your project's dependencies in a text file:

```bash
python3 -m pip freeze > requirements.txt
```

Anyone (including you, on a fresh machine) can recreate the same environment:

```bash
python3 -m pip install -r requirements.txt
```

A typical `requirements.txt` looks like:

```
requests==2.31.0
fastapi>=0.110,<0.111
sqlalchemy~=2.0
```

## Where do packages get installed?

By default, in your **site-packages** directory — global to the Python you're using.

```bash
python3 -m pip show requests | grep Location
```

That's a problem: if Project A needs `django==3` and Project B needs `django==4`, they collide. The fix is **virtual environments** — the next lesson.

## `--user` installs

If you can't (or don't want to) use a virtual environment, install for your user only — no `sudo`, no system-level changes:

```bash
python3 -m pip install --user requests
```

This puts the package under your home directory. It's still global to that Python, just to your user.

## Searching PyPI

`pip search` was disabled. Use the website: [pypi.org](https://pypi.org).

## Modern alternatives

`pip` is the universal baseline, but the ecosystem has moved on:

| Tool            | What it adds                                                                                                 |
| --------------- | ------------------------------------------------------------------------------------------------------------ |
| **`pip-tools`** | `pip-compile` produces a deterministic locked `requirements.txt`.                                            |
| **`poetry`**    | Dependency management + packaging + virtualenvs in one tool. `pyproject.toml` instead of `requirements.txt`. |
| **`uv`**        | Modern, very fast (Rust-based) drop-in for `pip`/`pip-tools`/`virtualenv`.                                   |
| **`conda`**     | Package manager popular in data science; handles non-Python deps too.                                        |

For learning, plain `pip` + a virtual environment is enough. As your projects grow, look into `poetry` or `uv`.

## Common gotchas

### "I installed it but Python can't find it"

You almost certainly used a different Python than the one you're now running. Always use `python3 -m pip install ...` to be sure.

### "pip is out of date"

```bash
python3 -m pip install --upgrade pip
```

### Permission denied

You're trying to install into a system directory. Use a virtual environment, or add `--user`.

## Try it

```bash
python3 -m pip install --user rich
python3 -c "from rich import print; print('[bold red]Hello[/] from rich!')"
```

`rich` is a popular library for pretty terminal output. The colored text proves the install worked.
