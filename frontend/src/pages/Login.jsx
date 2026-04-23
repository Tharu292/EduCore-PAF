import { SignIn } from "@clerk/clerk-react";

const Login = () => {
  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <SignIn routing="path" path="/login" signUpUrl="/signup" />
    </div>
  );
};

export default Login;