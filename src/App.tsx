import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { Student } from './types';
import { UserPlus, GraduationCap, Mail, IdCard, BookOpen, Loader2, Trash2, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import SignIn from './components/Auth/SignIn';
import SignUp from './components/Auth/SignUp';

function Dashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Omit<Student, 'id' | 'created_at'>>({
    full_name: '',
    email: '',
    course: '',
    student_id: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();

    const subscription = supabase
      .channel('students_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, () => {
        fetchStudents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  async function fetchStudents() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (err: any) {
      console.error('Error fetching students:', err.message);
      if (err.message?.includes('Forbidden use of secret API key')) {
        setError('⚠️ SECURITY ERROR: You are using the "service_role" key. Please replace it with the "anon" public key in your Secrets panel.');
      } else {
        setError(`Failed to load students: ${err.message || 'Check Supabase configuration'}`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const { error } = await supabase.from('students').insert([formData]);
      if (error) throw error;

      setFormData({
        full_name: '',
        email: '',
        course: '',
        student_id: '',
      });
    } catch (err: any) {
      console.error('Error adding student:', err.message);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteStudent(id: string) {
    try {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) throw error;
    } catch (err: any) {
      console.error('Error deleting student:', err.message);
      setError(err.message);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">EduReg</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-500 font-medium hidden sm:block">
              Student Registration Portal
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6"
            >
              <div className="flex items-center gap-2 mb-6">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-semibold">Register Student</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <input
                      required
                      type="text"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                      placeholder="John Doe"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    />
                    <IdCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Student ID</label>
                  <div className="relative">
                    <input
                      required
                      type="text"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                      placeholder="STU-2024-001"
                      value={formData.student_id}
                      onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                    />
                    <IdCard className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                  <div className="relative">
                    <input
                      required
                      type="email"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                      placeholder="john@university.edu"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Course / Major</label>
                  <div className="relative">
                    <input
                      required
                      type="text"
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                      placeholder="Computer Science"
                      value={formData.course}
                      onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    />
                    <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                    {error}
                  </div>
                )}

                <button
                  disabled={submitting}
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Register Student
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </div>

          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg font-semibold">Registered Students</h2>
                </div>
                <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">
                  {students.length} Total
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Course</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">ID Number</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <AnimatePresence mode="popLayout">
                      {loading ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-2" />
                            <p className="text-slate-500 text-sm">Loading records...</p>
                          </td>
                        </tr>
                      ) : students.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-6 py-12 text-center">
                            <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                              <GraduationCap className="w-6 h-6 text-slate-300" />
                            </div>
                            <p className="text-slate-500 text-sm font-medium">No students registered yet.</p>
                            <p className="text-slate-400 text-xs mt-1">Fill out the form to add your first student.</p>
                          </td>
                        </tr>
                      ) : (
                        students.map((student) => (
                          <motion.tr
                            layout
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0, x: -20 }}
                            key={student.id}
                            className="group hover:bg-slate-50/50 transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-semibold text-slate-900">{student.full_name}</span>
                                <span className="text-sm text-slate-500">{student.email}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                                {student.course}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-mono text-sm text-slate-600">
                              {student.student_id}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => student.id && deleteStudent(student.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-auto py-8 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
          &copy; 2024 EduReg Student Management. Built with React & Supabase.
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={session ? <Dashboard /> : <Navigate to="/signin" />} 
        />
        <Route 
          path="/signin" 
          element={!session ? <SignIn /> : <Navigate to="/" />} 
        />
        <Route 
          path="/signup" 
          element={!session ? <SignUp /> : <Navigate to="/" />} 
        />
      </Routes>
    </BrowserRouter>
  );
}
