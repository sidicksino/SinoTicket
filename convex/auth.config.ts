// Clerk issues the JWTs that Convex verifies.
// CLERK_JWT_ISSUER_DOMAIN is the Clerk "Frontend API URL"
// (e.g. https://your-app.clerk.accounts.dev), set with:
//   npx convex env set CLERK_JWT_ISSUER_DOMAIN https://...
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
};
