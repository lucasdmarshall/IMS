const { exec } = require('child_process');

console.log(`
To create a new GitHub repository and push your code, follow these steps:

1. Open a web browser and go to https://github.com/lucasdmarshall
2. Sign in if you're not already logged in
3. Click on the "+" icon in the top right corner and select "New repository"
4. For Repository name, enter: IMS-official
5. Add an optional description: "Inventory Management System"
6. Choose the visibility of your repository (Public or Private)
7. DON'T initialize the repository with any files
8. Click "Create repository"
9. After creation, copy the commands GitHub provides and run them in your terminal

If you're still having issues, here are some troubleshooting tips:
- Ensure you're logged in to the correct GitHub account
- Check that you have the necessary permissions to create repositories
- If using HTTPS, you may need to generate a personal access token in GitHub Settings > Developer Settings > Personal Access Tokens
- If using SSH, ensure your SSH key is properly set up with GitHub

After creating the repository, run:
git push -u origin main

When prompted, enter your GitHub credentials or personal access token.
`); 