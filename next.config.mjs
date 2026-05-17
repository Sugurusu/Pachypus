const isGithubPages = process.env.GITHUB_PAGES === "true";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: isGithubPages ? "export" : undefined,
  basePath: isGithubPages ? "/Pachypus" : undefined,
  assetPrefix: isGithubPages ? "/Pachypus/" : undefined,
  trailingSlash: true
};

export default nextConfig;
