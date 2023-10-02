import React, { useState, useEffect } from 'react';

type PlainFormFieldOnChange = (obj: { name: string, value: string }) => void;
type ValidateFormFieldOnChange = (obj: { name: string, value: string, error: string | undefined }) => void;

type PlainFormFieldProps = {
  placeholder?: string;
  name: string;
  type: string;
  value: string;
  onChange: PlainFormFieldOnChange
  styles: string;
  required: boolean;
};

export interface RecordCheckResponse extends Response {
  exists: boolean;
}

const PlainFormField: React.FC<PlainFormFieldProps> = ({ 
  placeholder, 
  name, 
  type, 
  value: propsValue, 
  onChange, 
  styles, 
  required,
}) => {
  const { value, handleChange } = useFormField(propsValue, onChange);

  return (
    <div className="w-full">
      <div className="flex">
        <input
          type={type}
          name={name}
          placeholder={placeholder || ''}
          value={value}
          onChange={handleChange}
          className={styles}
          onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.placeholder = ""}
        />
        {required ? <span className='text-noct-orange text-2xl pl-1'>*</span> : <div className='ml-2 pl-1'></div>}
      </div>
    </div>
  );
}

// ### Check input with a validate function
type ValidateFormFieldProps = {
  placeholder?: string;
  name: string;
  type: string;
  value: string;
  validate: (value: string) => string | undefined;
  onChange: ValidateFormFieldOnChange
  styles: string;
  required: boolean;
};

const ValidateFormField: React.FC<ValidateFormFieldProps> = ({ 
  placeholder, 
  name, 
  type, 
  value: propsValue, 
  validate,
  onChange, 
  styles, 
  required,
}) => {
  const { value, error, handleChange } = useFormField(propsValue, onChange, validate);

  return (
    <div className="w-full">
      <span className="text-noct-orange">{error}</span>
      <div className="flex">
        <input
          type={type}
          name={name}
          placeholder={placeholder || ''}
          value={value}
          onChange={handleChange}
          className={styles}
          onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.placeholder = ""}
        />
        {required ? <span className='text-noct-orange text-2xl pl-1'>*</span> : <div className='ml-2 pl-1'></div>}
      </div>
    </div>
  );
}

// ### Check input with the server

type ServerConnectedFormFieldProps = {
  placeholder?: string;
  name: string;
  type: string;
  value: string;
  validate: (value: string) => string | undefined;
  onChange: (obj: {name: string, value: string, error: string | undefined}) => void;
  styles: string;
  serverFunction: (fieldName: string, value: string) => Promise<RecordCheckResponse>;
  required: boolean;
};

const ServerConnectedFormField: React.FC<ServerConnectedFormFieldProps> = ({ 
  placeholder, 
  name, 
  type, 
  value: propsValue, 
  validate, 
  onChange, 
  styles, 
  serverFunction, 
  required,
}) => {
  const { value, error, handleChange, handleBlur } = useFormField(propsValue, onChange, validate, serverFunction);

  return (
    <div className="w-full">
      <span className="text-noct-orange">{error}</span>
      <div className="flex">
        <input
          type={type}
          name={name}
          placeholder={placeholder || ''}
          value={value}
          onChange={handleChange}
          className={styles}
          onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.placeholder = ""}
          onBlur={handleBlur}
        />
        {required ? <span className='text-noct-orange text-2xl pl-1'>*</span> : <div className='ml-2 pl-1'></div>}
      </div>
    </div>
  );
}

// ### Abstract common logic shared from FormField components

const useFormField = (
  propsValue: string,
  onChange: PlainFormFieldOnChange | ValidateFormFieldOnChange,
  validate?: (arg: string) => string | undefined,
  serverFunction?: (fieldName: string, value: string) => Promise<RecordCheckResponse>
) => {
  const [value, setValue] = useState(propsValue);
  const [error, setError] = useState<string | undefined>(undefined);

  useEffect(() => {
    setValue(propsValue);
  }, [propsValue]);

  const handleChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const value = evt.target.value;
    const error = validate ? validate(value) : undefined;

    setValue(value);
    setError(error);

    onChange({name: evt.target.name, value, error});
  };

  const handleBlur = async (evt: React.FocusEvent<HTMLInputElement>) => {
    if (!serverFunction) return;

    const value = evt.target.value;
    const name = evt.target.name;
    let error = validate ? validate(value) : undefined;
    if(!value){
      return;
    }
    await serverFunction(name, value)
      .then(async (data: RecordCheckResponse) => {
        if (data.exists) {
          setValue(value);
          error = `${name} already in use`;
          setError(error);
          onChange({name, value, error})
        } else {
          error = undefined
          setValue(value);
          setError(error);
          onChange({name, value, error})
        }
      })
  };

  return { value, error, handleChange, handleBlur };
};

export { PlainFormField, ValidateFormField, ServerConnectedFormField }