import { SignUp } from "@clerk/clerk-react";

const Register = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <SignUp routing="path" path="/signup" signInUrl="/login" />
    </div>
  );
};

export default Register;