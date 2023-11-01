export const withFormFieldDisplayWrapper = (Component: any) => (props: any) => (
  <div className='p-1 w-6/12 border-0 px-0 mx-auto'>
    <Component {...props} />
  </div>
)