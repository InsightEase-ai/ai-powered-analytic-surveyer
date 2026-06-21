import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lightbulb, EyeOff, Eye, GraduationCap, SquareUser, BarChart3, Briefcase, Mail, Check } from 'lucide-react';
import heroImg from '../assets/hero.png';

const schema = z.object({
  role: z.enum(['student', 'lecturer', 'researcher', 'owner']),
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'At least 8 characters')
    .regex(/[A-Z]/, 'Requires uppercase')
    .regex(/[0-9]/, 'Requires number')
    .regex(/[^A-Za-z0-9]/, 'Requires special character'),
  confirmPassword: z.string().min(1, 'Confirm password required'),
  terms: z.boolean().refine(val => val === true, { message: 'Must agree to terms' }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      role: 'student',
      terms: false,
    },
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  const passwordValue = watch('password') || '';
  const requirements = [
    { label: 'At least 8 characters long', valid: passwordValue.length >= 8 },
    { label: 'Include an uppercase letter', valid: /[A-Z]/.test(passwordValue) },
    { label: 'Include a number', valid: /[0-9]/.test(passwordValue) },
    { label: 'Include a special character', valid: /[^A-Za-z0-9]/.test(passwordValue) }
  ];

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F4F6F8] flex flex-col items-center justify-between p-4 md:p-6 font-sans text-sm">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl flex flex-col md:flex-row overflow-hidden flex-1 min-h-0">
        
        {/* Left Panel */}
        <div className="bg-[#0B192C] text-white w-full md:w-1/2 p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="text-2xl lg:text-3xl font-bold mb-1">InsightEase</h1>
            <p className="text-[#8BB1D4] text-base lg:text-lg">Guided by the Data Sherpa.</p>
          </div>

          <div className="flex-grow flex items-center justify-center relative z-10 mt-4 mb-4">
            <div className="relative">
              {/* Tooltip */}
              <div className="absolute -top-12 -left-4 lg:-top-16 lg:-left-6 bg-gray-200 text-[#0B192C] text-xs px-3 py-2 lg:px-4 lg:py-3 rounded-2xl shadow-lg w-44 lg:w-52 opacity-95">
                <div className="flex items-center gap-2 mb-1">
                  <div className="bg-[#087F8C] rounded-full p-1">
                    <Lightbulb size={10} className="text-white lg:w-3 lg:h-3" />
                  </div>
                  <span className="font-bold text-[9px] lg:text-[10px] tracking-wider uppercase">Sherpa Insight</span>
                </div>
                <p className="text-[10px] lg:text-xs">Let's start your data insights journey!</p>
                {/* Tooltip tail */}
                <div className="absolute -bottom-1.5 left-6 lg:-bottom-2 lg:left-8 w-3 h-3 lg:w-4 lg:h-4 bg-gray-200 rotate-45"></div>
              </div>
              <img src={heroImg} alt="Data Sherpa" className="w-[180px] h-[180px] lg:w-[260px] lg:h-[260px] object-cover rounded-xl shadow-2xl relative z-10" />
            </div>
          </div>

          <div className="relative z-10">
            <p className="text-[#8BB1D4] text-xs lg:text-sm leading-relaxed max-w-sm">
              Join 10,000+ researchers gaining deep clarity through expert-guided analytics.
            </p>
          </div>
          
          {/* Subtle background decoration */}
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-[#112a4a] to-transparent rounded-full opacity-30 -mr-20 -mb-20 pointer-events-none"></div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-1/2 px-8 py-5 lg:px-12 lg:py-6 flex flex-col justify-center bg-white relative min-h-0 overflow-y-auto">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1">Create Your Account</h2>
          <p className="text-gray-500 mb-4 text-xs lg:text-sm">Start your insights journey with InsightEase.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
            {/* Roles */}
            <div>
              <label className="block text-[11px] lg:text-xs font-bold text-gray-900 mb-1.5">I am a...</label>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <div className="flex gap-2 w-full justify-between">
                    {[
                      { id: 'student', label: 'STUDENT', icon: GraduationCap },
                      { id: 'lecturer', label: 'LECTURER', icon: SquareUser },
                      { id: 'researcher', label: 'RESEARCHER', icon: BarChart3 },
                      { id: 'owner', label: 'OWNER', icon: Briefcase },
                    ].map((role) => (
                      <button
                        key={role.id}
                        type="button"
                        onClick={() => field.onChange(role.id)}
                        className={`flex flex-col items-center justify-center py-2 px-1 lg:px-2 flex-1 rounded-xl lg:rounded-2xl transition-all duration-200 ${
                          field.value === role.id 
                            ? 'bg-[#5CE1E6] text-teal-900 shadow-sm' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <role.icon size={16} className="mb-0.5 lg:w-[18px] lg:h-[18px]" strokeWidth={2.5} />
                        <span className="text-[8px] lg:text-[9px] font-bold tracking-wider">{role.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>

            {/* Name and Email Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-900 mb-1 lg:mb-1.5">Full Name</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lg:w-4 lg:h-4"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    {...register('fullName')}
                    className={`w-full bg-gray-100 border-none rounded-full pl-9 pr-3 py-2.5 lg:py-3 focus:ring-2 focus:ring-[#0B192C] outline-none text-gray-800 placeholder-gray-400 text-xs lg:text-sm ${
                      errors.fullName ? 'ring-2 ring-red-500' : ''
                    }`}
                  />
                </div>
                {errors.fullName && <p className="text-red-500 text-[9px] mt-0.5 px-2">{errors.fullName.message}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-900 mb-1 lg:mb-1.5">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="name@company.com"
                    {...register('email')}
                    className={`w-full bg-gray-100 border-none rounded-full pl-4 pr-9 py-2.5 lg:py-3 focus:ring-2 focus:ring-[#0B192C] outline-none text-gray-800 placeholder-gray-400 text-xs lg:text-sm ${
                      errors.email ? 'ring-2 ring-red-500' : ''
                    }`}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <Mail size={14} className="lg:w-4 lg:h-4" />
                  </div>
                </div>
                {errors.email && <p className="text-red-500 text-[9px] mt-0.5 px-2">{errors.email.message}</p>}
              </div>
            </div>

            {/* Passwords Row */}
            <div className="grid grid-cols-2 gap-3 mt-1">
              <div>
                <label className="block text-[11px] font-bold text-gray-900 mb-1 lg:mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
                    {...register('password')}
                    className={`w-full bg-gray-100 border-none rounded-full pl-4 pr-9 py-2.5 lg:py-3 focus:ring-2 focus:ring-[#0B192C] outline-none text-gray-800 placeholder-gray-400 text-xs lg:text-sm ${
                      errors.password ? 'ring-2 ring-red-500' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={14} className="lg:w-4 lg:h-4" /> : <Eye size={14} className="lg:w-4 lg:h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-900 mb-1 lg:mb-1.5">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm your password"
                    {...register('confirmPassword')}
                    className={`w-full bg-gray-100 border-none rounded-full pl-4 pr-9 py-2.5 lg:py-3 focus:ring-2 focus:ring-[#0B192C] outline-none text-gray-800 placeholder-gray-400 text-xs lg:text-sm ${
                      errors.confirmPassword ? 'ring-2 ring-red-500' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-700 focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff size={14} className="lg:w-4 lg:h-4" /> : <Eye size={14} className="lg:w-4 lg:h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-[9px] mt-0.5 px-2">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            {/* Password Requirements */}
            <div className="flex flex-col gap-0.5 mt-1 px-1">
              {requirements.map((req, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check size={12} className={req.valid ? "text-[#087F8C]" : "text-gray-300"} strokeWidth={3} />
                  <span className={`text-[9px] lg:text-[10px] ${req.valid ? "text-gray-700" : "text-gray-500"}`}>{req.label}</span>
                </div>
              ))}
            </div>

            {/* Terms and Conditions */}
            <div className="mt-1">
              <label className="flex items-center cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    {...register('terms')}
                    className="peer appearance-none w-3.5 h-3.5 border border-gray-300 rounded-sm checked:bg-white checked:border-[#087F8C] transition-all"
                  />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none">
                    <Check size={10} className="text-[#087F8C]" strokeWidth={4} />
                  </div>
                </div>
                <span className="ml-2 text-[10px] lg:text-[11px] text-gray-700">
                  I agree to the <a href="#" className="font-bold text-[#087F8C] hover:underline">Terms of Service</a> and <a href="#" className="font-bold text-[#087F8C] hover:underline">Privacy Policy</a>
                </span>
              </label>
              {errors.terms && <p className="text-red-500 text-[9px] mt-0.5 px-1">{errors.terms.message}</p>}
            </div>

            {/* Signup Button */}
            <button
              type="submit"
              className="w-full bg-[#0B192C] hover:bg-[#112a4a] text-white font-medium rounded-full py-2.5 lg:py-3 mt-1 transition-colors duration-200 shadow-md text-xs lg:text-sm"
            >
              Create Account
            </button>

            {/* OR separator */}
            <div className="flex items-center justify-center my-1.5 opacity-60">
              <div className="border-t border-gray-200 flex-grow"></div>
              <span className="px-3 text-[9px] lg:text-[10px] font-semibold text-gray-400 uppercase tracking-widest">or</span>
              <div className="border-t border-gray-200 flex-grow"></div>
            </div>

            {/* Google Signup */}
            <button
              type="button"
              className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-gray-900 font-semibold rounded-full py-2.5 lg:py-3 flex items-center justify-center gap-2 lg:gap-3 transition-colors shadow-sm text-xs lg:text-sm"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="lg:w-[16px] lg:h-[16px]">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Sign up with Google
            </button>

            {/* Sign in link */}
            <div className="text-center mt-1">
              <p className="text-gray-600 text-[11px] lg:text-xs">
                Already have an account? <a href="/" className="text-[#087F8C] font-bold ml-1 hover:underline">Sign in</a>
              </p>
            </div>
          </form>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="w-full max-w-5xl mt-4 pt-4 border-t border-gray-200 flex flex-col md:flex-row items-center justify-between text-xs lg:text-sm text-gray-500 pb-2">
        <div className="flex flex-col gap-1 mb-2 md:mb-0 items-center md:items-start">
          <span className="font-bold text-gray-900 text-sm lg:text-base">InsightEase</span>
          <span className="text-[10px] lg:text-xs">© 2024 InsightEase. Guided by the Data Sherpa.</span>
        </div>
        <div className="flex flex-wrap justify-center gap-4 lg:gap-6 text-[10px] lg:text-xs">
          <a href="#" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-gray-900 transition-colors">Help Center</a>
          <a href="#" className="hover:text-gray-900 transition-colors">API Documentation</a>
        </div>
      </footer>
    </div>
  );
}

export default SignUp;
