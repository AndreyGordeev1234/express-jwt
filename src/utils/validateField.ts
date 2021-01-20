type Field = 'email' | 'password';

export const validateField = (field: Field, item: any): string | null => {
  if (field === 'email') {
    if (!validateEmail(item)) return 'Incorrect email';
  } else if (field === 'password') {
    if (!validatePassword(item))
      return 'Password should contain at least one digit, one lower case, one upper case, 8 characters';
  }
  return null;
};

const validateEmail = (email: string) => {
  const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
};

const validatePassword = (password: string) => {
  const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/;
  return re.test(password);
};
