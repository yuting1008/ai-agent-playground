export const handler: Function = async ({
  ...args
}: {
  [key: string]: any;
}) => {
  console.log(args);
  alert(JSON.stringify(args, null, 2));

  return {
    message: 'success',
  };
};
