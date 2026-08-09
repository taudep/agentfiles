---
name: python-cli
description: Use this skill when the user wants to create a python CLI program.  It has specific instructions on how to structure program, which libraries to use, and how to do all the python things. 
---

# Python CLI Skill

  # Development Guidelines

  This document contains critical information about working with this codebase. Follow these guidelines precisely.

  ## Core Development Rules

  1. Package Management
    - ONLY use uv, NEVER pip
    - Installation: `uv add package`
    - Running tools: `uv run tool`
    - Upgrading: `uv add --dev package --upgrade-package package`
    - FORBIDDEN: `uv pip install`, `@latest` syntax

  2. Code Quality
    - Type hints required for all code
    - Public APIs must have docstrings
    - Functions must be focused and small
    - Follow existing patterns exactly
    - Line length: 88 chars maximum

  3. Testing Requirements
    - Framework: `uv run --frozen pytest`
    - Async testing: use asyncio
    - Coverage: test edge cases and errors
    - New features require tests
    - Bug fixes require regression tests
  
  4. Library Preferences
    - when making a connection to Snowflake database, use `snowflake-connector-python[secure-local-storage]` so that when a user has to SSO though externalBrowser connections, their token will be cached for future database calls
    - use `requests` for making remote HTTP calls
    - for non-Snowflake data access use Python's `SQLAlchemy` library, but don't use the ORM mode.
    - use `clicks` library for managing CLI programs an argument passing
    - If a TUI type of interface is requests, use `rich` library for simple stuff, but if complicated layouts are needed, or more desktop style TUIs, use `textual`
    - use `pyaml` for YAML
    - use `python-dotenv` to manage local .env variables and always create a template of `template.env` that the end user should copy and configure on their own.

  5. Code Structure for building CLI apps
    - all config should follow XDG Confid conventions.  Config files should follow a hierarchy, starting with reading from application directory, up to the XDG ~/.config
    - if the main file gets longer than around 350 lines, suggest to the programmer that it might be time to refactor and break the monolithic Python file.  Use the following rules to help structure and refactor the program.
    - Suggested structure for larger CLI apps:
    - break application into main.py that manages the interface to the terminal, including argument parsing and mapping to commands and services.
    - use a command pattern, where each command get's it's own file in the /commands director.  
    - Put all data access in a /repository or /data folder.
    - If external data is needed from third-parties, create Clients for each and put them in a /clients director.  
    - All testing artifacts go in /tests

  6. Creating Installers
    - refernce the file @python-cli-installable.md on how to make the python CLI installable to the users system.  However, if it's a single python script you're writing using PEP 723, ask the user if they just want to install it into folder in their PATH (default ~/dev/tools/scripts, but ask the user and then remember what they say to MEMORY).

  - For commits fixing bugs or adding features based on user reports add:
    ```bash
    git commit --trailer "Reported-by:<name>"
    ```
    Where `<name>` is the name of the user.

  - For commits related to a Github issue, add
    ```bash
    git commit --trailer "Github-Issue:#<number>"
    ```
  - NEVER ever mention a `co-authored-by` or similar aspects. In particular, never
    mention the tool used to create the commit message or PR.

  7. System Installation Requirements
    - All python scripts should be executable from anywhere in the terminal and should be installed programs to the /usr directory.
    - see the file ~/.config/.copilot/agents/plython-cli-installable.md for all details on building the install.sh and uninstall.sh scripts.


  ## Core Tools
  - gh
  - git
  - shell

  ## Python Tools
  
  ## Code Formatting

  1. Ruff
    - Format: `uv run --frozen ruff format .`
    - Check: `uv run --frozen ruff check .`
    - Fix: `uv run --frozen ruff check . --fix`
    - Critical issues:
      - Line length (88 chars)
      - Import sorting (I001)
      - Unused imports
    - Line wrapping:
      - Strings: use parentheses
      - Function calls: multi-line with proper indent
      - Imports: split into multiple lines

  ## Error Resolution

  2. Common Issues
    - Line length:
      - Break strings with parentheses
      - Multi-line function calls
      - Split imports
    - Types:
      - Add None checks
      - Narrow string types
      - Match existing patterns
    - Pytest
      - we use automatic detection of async defs

  3. Best Practices
    - Check git status before commits
    - Run formatters before type checks
    - Keep changes minimal
    - Follow existing patterns
    - Document public APIs
    - Test thoroughly

  ##  You write Python tools as single files. They always start with this comment:
```
# /// script
# requires-python = ">=3.12"
# ///
```

These files can include dependencies on libraries such as Click. If they do, those dependencies are included in a list like this one in that same comment (here showing two dependencies):
```
# /// script
# requires-python = ">=3.12"
# dependencies = [
#     "click",
#     "sqlite-utils",
# ]
# ///
```
  

