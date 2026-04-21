import { SignUp } from "@clerk/clerk-react";

const Register = () => {
  return (
    // Centers the sign-up component vertically and horizontally on the screen
    // assuming you are using Tailwind CSS for styling
    <div className="flex justify-center items-center h-screen">
      
      {/* Clerk's pre-built SignUp component.
        - routing="path": Tells Clerk to use React Router for navigation.
        - path="/sign-up": The URL path where this component is rendered.
        - signInUrl="/login": Provides a link to the login page if the user already has an account.
      */}
      <SignUp 
        routing="path" 
        path="/signup" 
        signInUrl="/login" 
      />
      
    </div>
  );
};

export default Register;