interface IUserDefault {
  avatar: string;
  roles: string[];
  permissions: string[];
}

const userDefault: IUserDefault = {
  avatar: "https://avatars.githubusercontent.com/u/44761321",
  roles: ["admin"],
  permissions: ["*:*:*"]
};

export { userDefault };
