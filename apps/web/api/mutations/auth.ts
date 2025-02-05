import axiosInstance from "../axiosInstance";

type CreateUserRequest = {
  name: string;
  email: string;
  password: string;
};

type LoginUserRequest = Pick<CreateUserRequest, "email" | "password">;

export const signup = async (details: CreateUserRequest) => {
  const { data } = await axiosInstance.post("/api/auth/signup", details);
  return data;
};

export const login = async (details: LoginUserRequest) => {
  const { data } = await axiosInstance.post("/api/auth/login", details);
  return data;
};
