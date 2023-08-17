const fs = require("fs");
const path = require("path");

const pluginDirs = fs
  .readdirSync("./packages")
  .filter((dir) => dir.startsWith("onote-plugin-"));

const plugins = [];

for (let dir of pluginDirs) {
  const pkgFile = path.resolve("./packages", dir, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgFile, "utf-8"));
  plugins.push({
    name: pkg.name,
    author: pkg.author,
    version: pkg.version,
    title: pkg.title,
    description: pkg.description,
    homepage: pkg.homepage,
    downloadUrl:`https://registry.npmmirror.com/${pkg.name}/-/${pkg.name.split('/').pop()}-${pkg.version}.tgz`
  });
}

fs.writeFileSync('repo.json', JSON.stringify({ plugins }, null, 2))