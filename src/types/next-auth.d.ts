import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      clinicId: string;
      role: string;
      name: string;
      email: string;
      subscriptionStatus: string;
    };
  }

  interface User {
    id: string;
    clinicId: string;
    role: string;
    name: string;
    email: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    clinicId: string;
    role: string;
    subscriptionStatus: string;
  }
}
