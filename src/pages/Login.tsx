import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, Github, Chrome as Google, Facebook } from 'lucide-react';
import { 
  signInWithEmailAndPassword, 
  signInWithPopup 
} from 'firebase/auth';
import { auth, googleProvider, facebookProvider } from '../firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Đăng nhập thành công!');
      navigate('/');
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/operation-not-allowed') {
        toast.error('Phương thức đăng nhập bằng Email/Mật khẩu chưa được kích hoạt trong Firebase Console.');
      } else {
        toast.error('Email hoặc mật khẩu không chính xác');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: any) => {
    setSocialLoading(true);
    try {
      await signInWithPopup(auth, provider);
      toast.success('Đăng nhập thành công!');
      navigate('/');
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        // Suppress console error for manual closure or cancellation
        toast.error('Cửa sổ đăng nhập đã bị đóng hoặc yêu cầu bị hủy. Vui lòng thử lại.');
      } else {
        console.error(error);
        if (error.code === 'auth/operation-not-allowed') {
          toast.error('Phương thức đăng nhập này chưa được kích hoạt. Vui lòng liên hệ Admin để bật Google/Facebook Login trong Firebase Console.');
        } else {
          toast.error('Đăng nhập thất bại: ' + (error.message || 'Lỗi không xác định'));
        }
      }
    } finally {
      setSocialLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-paper">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="border-none shadow-2xl shadow-primary/5 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="space-y-1 pt-10 pb-6 text-center bg-primary text-white">
            <CardTitle className="text-3xl font-serif font-bold">Quản trị viên</CardTitle>
            <CardDescription className="text-white/60">
              Đăng nhập bằng tài khoản Google Admin
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-12 pb-12 px-8 flex flex-col items-center justify-center">
            <Button 
              onClick={() => handleSocialLogin(googleProvider)}
              disabled={socialLoading}
              className="w-full h-14 rounded-2xl bg-white hover:bg-gray-50 text-primary border-2 border-gray-100 font-bold text-lg transition-all flex items-center justify-center space-x-4 shadow-xl shadow-primary/5"
            >
              {socialLoading ? (
                <span>Đang kết nối...</span>
              ) : (
                <>
                  <Google className="w-6 h-6" />
                  <span>Tiếp tục với Google</span>
                </>
              )}
            </Button>
            <p className="mt-8 text-xs text-gray-400 text-center leading-relaxed">
              Hệ thống chỉ cho phép truy cập đối với tài khoản <br />
              <span className="font-bold text-accent">tranduongtuanduy.6a4@gmail.com</span>
            </p>
          </CardContent>
          <CardFooter className="pb-10 pt-6 flex justify-center">
            <p className="text-sm text-gray-500">
              Trang quản trị dành riêng cho Admin Duy Tìm Trọ
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
