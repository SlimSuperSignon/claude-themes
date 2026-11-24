# Claude Theme Community

The themes people have published for the **Theme Gallery** plugin for Claude. The plugin reads this repository to show the Community shelf in its gallery, and creators publish here.

## Use these themes

In Claude, with the Theme Gallery plugin installed:

This community is the plugin's default, so there is nothing to set up. If you chose another community earlier, come back with:

```
/themes community SlimSuperSignon/claude-themes
```

Then open `/themes`: every theme here is on the Community shelf with a preview and its about page, and **Add** downloads one and turns it on. No account is needed.

## Publish a theme

1. In Claude, open your theme's about page in the gallery and press **Publish to community**, or run `/themes publish <name>`.
2. Click the link it gives. It opens this repository's **Submit a theme** form.
3. Press **Create**. A small theme arrives filled in; for a larger one, paste the theme file's contents into the **Theme file** box first.

Within about a minute a comment says whether the theme passed. A theme that passes goes live once a maintainer approves it. To update your theme, submit it again under the same name.

How to write a theme file is in the plugin's README.

## How it works

| Path | What it is |
| --- | --- |
| `themes/<name>.cctheme.json` | One file per published theme |
| `index.json` | The list the plugin reads: each theme's file and a card of it. Built by a script, never edited by hand |
| `owners.json` | Which GitHub account published each theme, so only its creator can update it |
| `lib/` | The plugin's own theme checker, copied here so the community accepts exactly what the plugin accepts |
| `scripts/intake.mjs` | Turns a submission into a theme file |
| `scripts/build-index.mjs` | Rebuilds `index.json`; with `--check`, verifies every theme |
| `.github/workflows/submit.yml` | Checks each submission and opens a pull request for it |
| `.github/workflows/check.yml` | Checks themes on pull requests and keeps the index current |

A submission is a GitHub issue. The workflow checks the theme and, when it passes, opens a pull request that adds the file. **Merging that pull request is the approval**: the theme is live as soon as it is merged, and the submission closes by itself. Closing the pull request without merging declines it.

## For maintainers

### One-time setup

1. Create a **public** repository on GitHub, with no README or license added by GitHub, and push this folder to it:

   ```
   git init -b main
   git add .
   git commit -m "Start the theme community"
   git remote add origin https://github.com/SlimSuperSignon/claude-themes.git
   git push -u origin main
   ```

2. On GitHub, open **Settings → Actions → General → Workflow permissions**. Choose **Read and write permissions** and tick **Allow GitHub Actions to create and approve pull requests**. Without this, submissions are checked but no pull request is opened.
3. Add a license file if you want one. The submission form asks creators to confirm a theme is their own work and free for anyone to use.

### Approving a theme

Each passing submission arrives as a pull request named `Theme: <name>`. Before merging:

- Open the theme file in the pull request and **read its `about` text**. The automatic check does not judge words.
- Check the name and description are not misleading or someone else's brand.
- Merge to approve, or close to decline and say why on the submission.

### Removing a theme

Delete its file from `themes/` and its line from `owners.json`. The index rebuilds itself when the change reaches `main`.

### Updating the checker

When the plugin's theme format changes, copy the plugin's `hooks/themes.ts` and `hooks/make-colors.js` over the ones in `lib/`, then run:

```
node scripts/build-index.mjs
```

The scripts need Node 24 or later, which runs the checker's TypeScript directly.

### What the automatic check covers

- The file is a theme: known fields only, every color well-formed, within the size limits.
- The app would paint it: text contrast is high enough on every surface.
- A moving scene holds no scripts, no event handlers and nothing loaded from a link.
- The name is not a built-in theme's and not another creator's.

A submission's text is only ever read as data. It is never put into a command.
