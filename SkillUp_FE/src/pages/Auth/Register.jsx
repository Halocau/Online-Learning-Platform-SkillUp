import { RegisterForm } from '@/components/register-form';

function Register() {
  return (
    <div className="flex min-h-screen">
      {/* Left Side - Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <RegisterForm />
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-yellow-400 to-yellow-500 items-center justify-center p-12">
        <div className="max-w-lg">
          <img 
            src="https://img.freepik.com/free-vector/online-tutorials-concept_52683-37481.jpg" 
            alt="Online Learning Illustration" 
            className="w-full h-auto drop-shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
}

export default Register;
