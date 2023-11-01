import isEmail from 'validator/lib/isEmail';
import React, { useContext, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ValidateFormField, ServerConnectedFormField } from './FormFields';
import { AuthContext } from '../context/AuthContext';
import { withFormFieldDisplayWrapper } from './withFormFieldDisplayWrapper';
import ExpressAPI from '../api/express-api';

type Fields = {
  username: string;
  password: string;
  email: string;
};

type Errors = {
  [key: string]: string | undefined;
};

type InputObject = {
  name: string,
  value: string,
  error?: string,
}

interface RegisterFormProps {
  expressApi: ExpressAPI;
}


const WrappedApiCallFormField = withFormFieldDisplayWrapper(ServerConnectedFormField)
const WrappedVailidateFormField = withFormFieldDisplayWrapper(ValidateFormField)

export const RegisterForm: React.FC<RegisterFormProps> = ({ expressApi }) => {
  const [fields, setFields] = useState<Fields>({ username: '', password: '', email: '' });
  const [fieldErrors, setFieldErrors] = useState<Errors>({});
  const [_saveStatus, setSaveStatus] = useState<string>('READY');
  const { register } = useContext(AuthContext)

  const missingRequiredFields = (): boolean => {
    const errMessages = Object.keys(fieldErrors).filter(k => fieldErrors[k]);
    if (!fields.email || !fields.username || !fields.password) return true;
    if (errMessages.length) return true;
    return false;
  };

  const onInputChange = ({name, value, error }: InputObject): void => {
    setFields(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  const onFormSubmit = async (evt: React.FormEvent<HTMLFormElement>): Promise<void> => {
    evt.preventDefault();

    if (missingRequiredFields()) return;

    setSaveStatus('SAVING');
    register(fields).then((success) => {
      success ? setSaveStatus('SUCCESS') : setSaveStatus('ERROR');
    })
  };

  return (
    <div className="h-screen">
      <h2 className="font-bold text-noct-white text-3xl mb-6">
        Create A New Account
      </h2>
      <form onSubmit={onFormSubmit}>
        <WrappedApiCallFormField 
          type={'text'} 
          name={'email'} 
          placeholder={'E-mail address'} 
          styles={"input[type='email'] w-full"}
          onChange={onInputChange}
          value={fields.email}
          validate={(val: string) => isEmail(val) ? undefined : "Enter an e-mail address"}
          serverFunction={expressApi.fieldExistsInDB}
          required={true}
        />
        <WrappedApiCallFormField 
          type={'text'} 
          name={'username'} 
          placeholder={'Username'} 
          styles={"input[type='text'] w-full"}
          onChange={onInputChange}
          value={fields.username}
          validate={() => undefined}
          serverFunction={expressApi.fieldExistsInDB}
          required={true}
        />
        <WrappedVailidateFormField
          type={'password'} 
          name={'password'} 
          placeholder={'Password'} 
          styles={"input[type='password'] w-full"}
          onChange={onInputChange}
          value={fields.password}
          validate={() => undefined} //TODO: add password validation
          required={true}
        />
      {
        (missingRequiredFields()) ?
          <div className="w-full flex justify-center">
            <button type='submit' className="whitespace-nowrap inline-flex items-center justify-center font-bold ease-in duration-200 rounded-full text-noct-white bg-noct-black w-6/12 my-3">
              <p className="py-3 text-noct-orange">
                Fill in *required fields
              </p>
            </button>
          </div>
        :
        {
          SAVING: (
            <div className="w-full flex justify-center">
              <button type='submit' className="whitespace-nowrap inline-flex items-center justify-center font-semibold ease-in duration-200 rounded-full outline outline-noct-blue text-noct-blue bg-inherit w-6/12 my-3 hover:bg-noct-blue hover:text-noct-white hover:outline-none">
                <p className="py-2">
                  Saving ...
                </p>
              </button>
            </div> 
          ),
          SUCCESS: <Navigate to='/new-user-redirect-to-login' />,
          ERROR: (
            <div className="w-full flex justify-center">
              <button type='submit' className="whitespace-nowrap inline-flex items-center justify-center font-semibold ease-in duration-200 rounded-full outline outline-noct-blue text-noct-blue bg-inherit w-6/12 my-3 hover:bg-noct-blue hover:text-noct-white hover:outline-none">
                <p className="py-2">
                  Failed
                </p>
              </button>
            </div> 
          ),
          READY: (
            <div className="w-full flex justify-center">
              <button type='submit' className="whitespace-nowrap inline-flex items-center justify-center font-semibold ease-in duration-200 rounded-full outline outline-noct-blue text-noct-blue bg-inherit w-6/12 my-3 hover:bg-noct-blue hover:text-noct-white hover:outline-none">
                <p className="py-2">
                  Create Account
                </p>
              </button>
            </div> 
          ),
        }[_saveStatus]
      }
        <div className="pt-1 text-noct-white">
          Already have an account?
          <Link to='/login' className='transition-all ml-3 underline text-noct-teal hover:no-underline hover:text-noct-gray'>
            Go to Log In
          </Link>
        </div>
      </form>
    </div>
  );
};

