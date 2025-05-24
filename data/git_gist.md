---
title: "Basic Git Workflow"
summary: "Git is a version control system that is used to track changes in the source code. It is a distributed version control system that is used to track changes in the source code",
publishedAt: "2025-02-11"
---

- Github has a lot of settings that you can change. You can change your username, email, and other settings. Whenever you checkpoint your changes, git will add some information about your such as your username and email to the commit. There is a git config file that stores all the settings that you have changed. You can make settings like what editor you would like to use etc. There are some global settings and some repository specific settings.
```sh
git config --global user.email "your-email@example.com"
git config --global user.name "Your Name"
# To check your config settings
git config --list
```
- log git in one line
```sh
git log --oneline
```

# git branch
---
- HEAD -> points to current branch you're working on
- create a branch and switch
```sh
git checkout -b new_branch
# or
git switch -c new_branch
# or
git branch new_branch
git switch new_branch
# see all the branches and current branch
git branch
```
- Think branches as a alternate timeline. You can keep in working different things in different branches.

### Fast-forward merge
![](https://docs.chaicode.com/_astro/fast-forward-merge.2JLs9oN__176LJB.webp)
- This one is easy as branch that you are trying to merge is usually ahead and there are no conflicts.
- When you are done working on a branch, you can merge it back into the main branch. This is done using the following command
- Merge all your works in different branch to the main branch
```sh
git checkout main
git merge new_branch
# NOTE: these files/changes also exits in new_branch after merging

```
### Not fast-forward merge
- When work is happening in both the branches
- In this type of merge, the main branch also worked and have some commits that are not in the `new_branch` branch. When you are done working on a branch, you can merge it back into the main branch
![](https://docs.chaicode.com/_astro/three-way-merge.C3EirtdW_Z1P6LdI.webp)
- Now conflicts might occur. You have to manually resolve the conflicts. Decide, what to keep and what to discard.
- After accepting changes or doing manually, add the file and commit

```sh
# Rename a branch
git branch -m old_branch new_branch
# delete a branch
git branch -d branch_name
```

# Basic Survival guide for Git
---
```zsh
# your working branch : devS, all the devs should merge to dev, the comes UAT, prod etc
# Step 1: You’re on dev
$ git checkout dev
$ git pull origin dev # get latest changes
# Let's say there’s 3 files: A, B, C

# Step 2: You create a new branch from dev
$ git checkout -b devS

# Step 3: You add a new file D, or edit B
$ git add .
$ git commit -m "added D"
$ git push origin devS # changes added to remote git server)

# Step 4: Check if you want to add any thing else and follow the Step 3

# Step 5: Come back to dev branch where you want to merge your changes
$ git checkout dev # ⚠️ It will replace B with the old version, and D will disappear — because dev never had them.
$ git pull origin dev #to get latest changes, usually good practice (optional)

# Step 6: Merge and resolve conflicts if any
$ git merge devS # changes should reflect to dev branch
# If conflicts occur, fix them then add, commit
$ git push origin dev # changes added to remote git server

# Step 7: Optional clean up
$ git branch -d devS                # delete local branch
$ git push origin --delete devS     # delete remote branch (optional)

```

# Basic Survival guide for Git -II

```sh
# Undoing mistakes 🔑

# Undo last commit (but keep the code):
$ git reset --soft HEAD~1

# Undo last commit and the changes
$ git reset --hard HEAD~1 # ⚠️ Be careful — --hard erases your code changes too.

# Revert a commit without changing history:
## If you already pushed a wrong commit:
$ git revert <commit-hash>

#

```


# diff stash and tags
---
### Stash : **Temporarily save unfinished changes**

- Use when you’re **in the middle of something**, but need to switch branches or pull clean code **without committing** your current work.
- Stash is a way to save your changes in a **temporary location.**
- It’s useful when switching branches without losing work. You can then come back to the file later and apply the changes.
```sh
# Step 1:
$ git stash        # saves your changes in a temporary location
or $ git stash save "work in progress on X feature" # give a name

# View stash list
$ git stash list

# Step 2 : Apply the most recent stash
$ git stash apply
# apply specific stash : $ git stash apply stash@{0}
# git stash apply stash@{0} <branch-name> -> apply to specific branch

# Step 3: apply and drop
$ git stash pop          # reapply & delete from stash list

# Drop the stash
$ git stash drop         # delete a stash manually

# Clear the stash (optinal)
$ git stash clear
```

# rebase and reflog
