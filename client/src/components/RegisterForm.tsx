import isEmail from 'validator/lib/isEmail';
import React, { useContext, useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { ValidateFormField, ServerConnectedFormField } from './FormFields';
import { AuthContext } from '../context/AuthContext';
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
      { 
        [
          {
            type: "text", 
            name: "email",
            placeholder: "E-mail address",
            styles: "input[type='email']",
            onChange: onInputChange,
            value: fields.email,
            validate: (val: string) => isEmail(val) ? undefined : "Enter an e-mail address",
            serverFunction: expressApi.fieldExistsInDB,
            required: true,
          },
          {
            type: "text", 
            name: "username",
            placeholder: "Username",
            styles: "input[type='text']",
            onChange: onInputChange,
            value: fields.username,
            validate: (_: string) => undefined,
            serverFunction: expressApi.fieldExistsInDB,
            required: true,
          },
          {
            type: "password",
            name: "password",
            placeholder: "Password",
            styles: "input[type='password']",
            onChange: onInputChange,
            value: fields.password,
            validate: (_: string) => undefined,
            required: true,
          },
        ].map((attrs) => (
            attrs.serverFunction ? 
              <div key={attrs.name} className="p-1 flex justify-center w-full col-full border-0 px-0">
                <ServerConnectedFormField 
                  type={attrs.type} 
                  name={attrs.name} 
                  placeholder={attrs.placeholder} 
                  styles={attrs.styles.concat(' w-full')}
                  onChange={attrs.onChange }
                  value={attrs.value}
                  validate={attrs.validate}
                  serverFunction={attrs.serverFunction}
                  required={attrs.required}
                />
              </div> 
            :
              <div key={attrs.name} className="p-1 flex justify-center w-full col-full border-0 px-0">
                <ValidateFormField 
                  type={attrs.type} 
                  name={attrs.name} 
                  placeholder={attrs.placeholder} 
                  styles={attrs.styles.concat(' w-full')}
                  onChange={attrs.onChange }
                  value={attrs.value}
                  validate={attrs.validate}
                  required={attrs.required}
                />
              </div>
          ))
      }
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