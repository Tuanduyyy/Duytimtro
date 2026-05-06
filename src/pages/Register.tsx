import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Lock, User, Phone, Github, Chrome as Google, Facebook } from 'lucide-react';
import { 
  createUserWithEmailAndPassword, 
  updateProfile,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider, facebookProvider } from '../firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update auth profile
      await updateProfile(user, { displayName: name });

      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email,
        name,
        phone,
        role: email === 'tranduongtuanduy.6a4@gmail.com' ? 'admin' : 'customer',
        createdAt: serverTimestamp()
      });

      toast.success('Đăng ký tài khoản thành công!');
      navigate('/');
    } catch (error: any) {
      console.error(error);
      if (error.code === 'auth/operation-not-allowed') {
        toast.error('Phương thức đăng ký bằng Email/Mật khẩu chưa được kích hoạt trong Firebase Console.');
      } else {
        toast.error(error.message || 'Đăng ký thất bại');
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
            <CardTitle className="text-3xl font-serif font-bold">Đăng ký tài khoản</CardTitle>
            <CardDescription className="text-white/60">
              Tham gia cộng đồng Duy Tìm Trọ ngay hôm nay
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-8 px-8">
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Nguyễn Văn A"
                    className="pl-10 h-12 rounded-xl"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10 h-12 rounded-xl"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Số điện thoại</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0901 234 567"
                    className="pl-10 h-12 rounded-xl"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="password"
                    type="password"
                    className="pl-10 h-12 rounded-xl"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    id="confirmPassword"
                    type="password"
                    className="pl-10 h-12 rounded-xl"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox id="terms" required />
                <label
                  htmlFor="terms"
                  className="text-sm text-gray-500 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Tôi đồng ý với <Link to="/terms" className="text-accent hover:underline font-bold">Điều khoản & Chính sách</Link>
                </label>
              </div>

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 rounded-xl bg-primary hover:bg-accent text-white font-bold text-lg transition-all mt-4"
              >
                {loading ? 'Đang xử lý...' : 'Tạo tài khoản'}
              </Button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-100"></span>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-4 text-gray-400 font-bold tracking-widest">Hoặc đăng ký bằng</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <Button 
                variant="outline" 
                disabled={socialLoading}
                onClick={() => handleSocialLogin(googleProvider)}
                className="h-12 rounded-xl border-gray-100 hover:bg-gray-50"
              >
                <Google className="w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                disabled={socialLoading}
                onClick={() => handleSocialLogin(facebookProvider)}
                className="h-12 rounded-xl border-gray-100 hover:bg-gray-50"
              >
                <Facebook className="w-5 h-5 fill-current" />
              </Button>
              <Button variant="outline" disabled={socialLoading} className="h-12 rounded-xl border-gray-100 hover:bg-gray-50">
                <Github className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
          <CardFooter className="pb-10 pt-6 flex justify-center">
            <p className="text-sm text-gray-500">
              Đã có tài khoản?{' '}
              <Link to="/duy-dang-nhap" className="text-accent hover:underline font-bold">
                Đăng nhập ngay
              </Link>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
