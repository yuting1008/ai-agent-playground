export const handler: Function = async ({
  ...args
}: {
  [key: string]: any;
}) => {
  console.log(args);

  return {
    message: 'success',
  };
};
