import React, { useContext, useState } from 'react';
import { Link, Navigate } from 'react-router-dom'
import isEmail from 'validator/lib/isEmail';
import { AuthContext } from '../context/AuthContext';
import { ValidateFormField } from './FormFields';

type Field = {
  email: string;
  password: string;
};

type Errors = {
  [key: string]: string | undefined;
};

type InputObject = {
  name: string,
  value: string,
  error?: string,
}

export const LogInForm: React.FC<{}> = () => {
  const [fields, setFields] = useState<Field>({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<Errors>({});
  const [saveStatus, setSaveStatus] = useState<string>('READY');
  const { logIn } = useContext(AuthContext);

  const missingRequiredFields = (): boolean => {
    const errMessages = Object.keys(fieldErrors).filter(k => fieldErrors[k]);
    return !fields.email || !fields.password || errMessages.length > 0;
  }

  const onInputChange = ({ name, value, error }: InputObject): void => {
    setFields(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: error }));
  };

  const onFormSubmit = (evt: React.FormEvent<HTMLFormElement>): void => {
    evt.preventDefault();

    if (missingRequiredFields()) return;

    setSaveStatus('SAVING');

    logIn(fields).then((success) => {
      success ? setSaveStatus('SUCCESS') : setSaveStatus('ERROR');
    });
  };

  return (
    <>
      <h2 className="font-bold text-noct-white text-3xl mb-6">
        Log In
      </h2>
      <form onSubmit={onFormSubmit} >
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
            },
            {
              type: "password",
              name: "password",
              placeholder: "Password",
              styles: "input[type='password']",
              onChange: onInputChange,
              value: fields.password,
              validate: (_: string) => undefined, // TODO add password validation
            }
          ].map((attrs) => (
            <div key={attrs.name} className="p-1 flex justify-center w-full col-full border-0 px-0">
              <ValidateFormField 
                type={attrs.type} 
                name={attrs.name} 
                placeholder={attrs.placeholder} 
                styles={attrs.styles.concat(' w-full')}
                onChange={attrs.onChange }
                value={attrs.value}
                validate={attrs.validate}
                required={false}
              />
            </div>
          ))
        }
        {
          missingRequiredFields() ?
            <div className="w-full flex justify-center">
              <button type='submit' className="whitespace-nowrap inline-flex items-center justify-center font-bold ease-in duration-200 rounded-full text-noct-white bg-noct-black w-6/12 my-3">
                <p className="py-2 text-noct-orange">
                  Fill in the fields
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
            SUCCESS: <Navigate to='/dashboard' />,
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
                    Log In
                  </p>
                </button>
              </div> 
            ),
          }[saveStatus]
        }
      </form>
      <div className="pt-1 text-noct-white">
        New to us?
        <Link to='/create-account' className='transition-all ml-3  underline text-noct-teal hover:no-underline hover:text-noct-gray'>
          Create an Account
        </Link>
      </div>
    </>
  );
};