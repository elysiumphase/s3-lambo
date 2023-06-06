# Contributing
Here are the guidelines we'd like you to follow:

- [Development](#development)
- [Issues and Bugs](#issue)
- [Feature Requests](#feature)
- [Pull Request Submission Guidelines](#submit-pr)
- [Commit Message Conventions](#commit)

## Development
Any contributor of this project should follow:
- [Git flow](https://danielkummer.github.io/git-flow-cheatsheet/);
- [ES6/7 features](https://github.com/lukehoban/es6features);
- [Airbnb's Javascript Style Guide](https://github.com/airbnb/javascript) within [ESLint](https://github.com/elysiumphase/esbnb).

## <a name="issue"></a> Found an Issue or Bug?
Before you submit an issue, please search the issue tracker, maybe an issue for your problem already exists and the discussion might inform you of workarounds readily available.

A minimal reproduce scenario allows us to quickly confirm a bug (or point out config problems) as well as confirm that we are fixing the right problem.

We will be insisting on a minimal reproduce scenario in order to save maintainers time and ultimately be able to fix more bugs. We understand that sometimes it might be hard to extract essentials bits of code from a larger code-base but we really need to isolate the problem before we can fix it.

Unfortunately, we are not able to investigate / fix bugs without a minimal reproduction, so if we don't hear back from you we are going to close an issue that doesn't have enough info to be reproduced.

## <a name="feature"></a> Feature Requests?
You can *request* a new feature by creating an issue on GitHub.

If you would like to *implement* a new feature, please submit an issue with a proposal for your work **first**, to be sure that particular feature makes sense for the project.

Once the issue submitted, always start your feature from creating a new branch from `develop` and not `master` as we may have some features still not ready to be merged to `master` yet.

## <a name="submit-pr"></a> Pull Request Submission Guidelines
Before you submit your Pull Request (PR) consider the following guidelines:

- Search Github for an open or closed PR that relates to your submission. You don't want to duplicate effort;
- Commit your changes using a descriptive commit message that follows our [commit message conventions](#commit). Adherence to these conventions is necessary because release notes are automatically generated from these messages;
- Fill out our `Pull Request Template`. Your pull request will not be considered if it is ignored.

## <a name="commit"></a> Commit Conventions
Each commit message consists of a **header**, a **body** and a **footer**.

The header has a special format that includes a **type**, a **scope** and a **subject**:

```
{type}({scope}): {subject}
{BLANK LINE}
{body}
{BLANK LINE}
{footer}
```

The **header** is mandatory and the **scope** of the header is optional.

Any line of the commit message cannot be longer than 100 characters. This allows the message to be easier to read on GitHub as well as in various git tools.

The footer should contain a [closing reference to an issue](https://help.github.com/articles/closing-issues-via-commit-messages/) if any.

Examples:

```
docs(readme): update error codes
```

```
fix: refer to the `entrypoint` instead of the first `module`
```

### Header

#### Type
Must be one of the following:

- **build**: Changes that affect the build system or external dependencies (example: npm);
- **chore**: Changes that fall outside of build / docs that do not effect source code (examples: package, defaults);
- **ci**: Changes to CI configuration files and scripts (examples: circleci, travis);
- **docs**: Documentation-only changes (examples: readme, changelog);
- **feature**: A new feature;
- **fix**: A bug fix;
- **perf**: A code change that improves performance;
- **refactor**: A code change that neither fixes a bug nor adds a feature;
- **revert**: Used when reverting a committed-change;
- **style**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons);
- **test**: Addition of or updates to tests.

#### Scope
The scope is subjective and depends on the `type` see above. A good example would be a change to a particular class/module.

#### Subject
The subject contains a succinct description of the change:

- use the imperative, present tense: "change" not "changed" nor "changes";
- don't capitalize the first letter;
- no dot (".") at the end.

### Body
Just as in the **subject**, use the imperative, present tense: "change" not "changed" nor "changes". The body should include the motivation for the change and contrast this with previous behavior.

### Footer
The footer should contain any information about **Breaking Changes** and is also the place to reference GitHub issues that this commit **Closes**.

**Breaking Changes** should start with the word `BREAKING CHANGE:` with a space or two new lines and the rest of the commit message.

### Revert
If the commit reverts a previous commit, it should begin with `revert:`, followed by the header of the reverted commit. In the body it should say: `This reverts commit {hash}.`, where the hash is the SHA of the commit being reverted.

## Thank you
Thank you for your interest, time, understanding, and for following this guide.
