import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Terminal, Activity, Server, Users, Clock, FileCode, Save, Upload, 
  ShieldAlert, Database, Plus, Trash2, Download, LogOut, Lock, Bell, 
  CheckCircle, X, Search, MessageSquare, Eye, Sparkles, Bot, FileText, 
  Send, CheckSquare, Square, MoreHorizontal, ChevronDown, Filter, 
  UserPlus, Settings, File, Paperclip, Shield, RefreshCw, AlertTriangle,
  Power, Zap, LayoutDashboard, Flag, Timer, PlayCircle, CheckCircle2, UserCheck, 
  Cpu, HardDrive, Wifi, Command, Moon, Sun, Briefcase, Layout, List, History,
  Image as ImageIcon, Paperclip as AttachmentIcon, CornerDownLeft, Key, Copy,
  BookOpen, ChevronRight, ChevronUp, Globe, Smartphone, HardDrive as Disk,
  BarChart2, PieChart, Edit, Calendar, StickyNote, PenTool, Smile, XCircle,
  Maximize2
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, 
  onSnapshot, serverTimestamp, query, orderBy, where, getDocs, limit, Timestamp, increment, writeBatch 
} from 'firebase/firestore';
import { 
  getAuth, signInAnonymously, onAuthStateChanged, signInWithCustomToken 
} from 'firebase/auth';

// --- FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: 'AIzaSyDWRp3qxHiwMUUCyGbbV0Tg0pQsEAbsntY',
  authDomain: 'serverly-10961.firebaseapp.com',
  projectId: 'serverly-10961',
  storageBucket: 'serverly-10961.firebasestorage.app',
  messagingSenderId: '555536460110',
  appId: '1:555536460110:web:25a50fa6fff065508e161f',
  measurementId: 'G-QCJ213WK7L',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = '1:555536460110:web:25a50fa6fff065508e161f';
const apiKey = ""; // Injected

// --- MOCK GIF DATA (Since we don't have a Giphy Key) ---
const MOCK_GIFS = [
  { id: 1, url: "https://media.giphy.com/media/l0HlHFRbmaZtBRhXG/giphy.gif", tags: "happy excited yay" },
  { id: 2, url: "https://media.giphy.com/media/26u4cqiYI30juCOGY/giphy.gif", tags: "coding computer hacker" },
  { id: 3, url: "https://media.giphy.com/media/3o7TKr3nzbh5WgCFxe/giphy.gif", tags: "waiting loading time" },
  { id: 4, url: "https://media.giphy.com/media/l0Iy9Qcyz0AwYvuEg/giphy.gif", tags: "love heart like" },
  { id: 5, url: "https://media.giphy.com/media/xT5LMHxhOfscxPfIfm/giphy.gif", tags: "funny lol laugh" },
  { id: 6, url: "https://media.giphy.com/media/d2Z4rTi11c9LRita/giphy.gif", tags: "no stop reject" },
  { id: 7, url: "https://media.giphy.com/media/3o6ZxpC3I8T9rTjF8Q/giphy.gif", tags: "yes agree nod" },
  { id: 8, url: "https://media.giphy.com/media/xT9IgG50Fb7Mi0prBC/giphy.gif", tags: "mindblown wow" },
  { id: 9, url: "https://media.giphy.com/media/l41Yh18f5T017206c/giphy.gif", tags: "sad cry tears" },
  { id: 10, url: "https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif", tags: "party dance celebrate" },
  { id: 11, url: "https://media.giphy.com/media/l2JEW1P125tJ8Zq6c/giphy.gif", tags: "fire hot cool" },
  { id: 12, url: "https://media.giphy.com/media/xT0xeJpnrWC4XWblEk/giphy.gif", tags: "money rich success" }
];

// --- HELPERS ---
const formatDuration = (ms) => {
  if (!ms || ms < 0) return "0m";
  const minutes = Math.floor(ms / 60000);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
};

const timeAgo = (date) => {
  if (!date) return "";
  const d = date.toDate ? date.toDate() : new Date(date);
  const seconds = Math.floor((new Date() - d) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

// --- APP COMPONENT ---
export default function App() {
  // Auth & User
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);

  // Data
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tickets, setTickets] = useState([]);
  const [todos, setTodos] = useState([]);
  const [users, setUsers] = useState([]); 
  const [logs, setLogs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [articles, setArticles] = useState([]); 
   
  // Settings & System
  const [settingsDocId, setSettingsDocId] = useState(null);
  const [globalMessage, setGlobalMessage] = useState("");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [serverStats, setServerStats] = useState({ cpu: 12, ram: 45, net: 20 });
  const [settingsSubTab, setSettingsSubTab] = useState('general');
  const [quickNotes, setQuickNotes] = useState(() => localStorage.getItem('quick_notes') || "");

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [ticketViewMode, setTicketViewMode] = useState('list');
  const [showNewTicketModal, setShowNewTicketModal] = useState(false);
  const [showNewUserModal, setShowNewUserModal] = useState(false);
  const [showNewArticleModal, setShowNewArticleModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [expandedArticle, setExpandedArticle] = useState(null);
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [editingTodoText, setEditingTodoText] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  
  // Chat Specific State
  const [chatInput, setChatInput] = useState("");
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSearch, setGifSearch] = useState("");
  const [chatAttachment, setChatAttachment] = useState(null); // { type: 'image', data: base64, name: string }
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);
  const [zoomedImage, setZoomedImage] = useState(null);

  // Inputs
  const [newTodoInput, setNewTodoInput] = useState("");
  const [newTicketData, setNewTicketData] = useState({ title: "", priority: "Medium", category: "General" });
  const [newUserData, setNewUserData] = useState({ username: "", password: "", name: "", email: "", role: "Staff", status: "Active" }); 
  const [newArticleData, setNewArticleData] = useState({ title: "", category: "General", content: "" });

  // AI
  const [aiOutput, setAiOutput] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // --- NOTIFICATION SYSTEM ---
  const addNotification = (type, message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => setNotifications(prev => prev.filter(n => n.id !== id)), 4000);
  };

  // --- AUDIT LOGGING ---
  const logAudit = async (action, details) => {
    if (!firebaseUser || !currentUser) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'audit_logs'), {
        action, details, user: currentUser.name, role: currentUser.role, timestamp: serverTimestamp()
      });
    } catch(e) { console.error("Audit fail", e); }
  };

  // --- INIT ---
  useEffect(() => {
    const initApp = async () => {
      const savedUser = localStorage.getItem('serverly_session_user');
      const savedToken = localStorage.getItem('serverly_session_token');

      if (savedUser && savedToken === 'valid') {
          try {
              const parsedUser = JSON.parse(savedUser);
              setCurrentUser(parsedUser);
              setIsLoggedIn(true);
              addNotification("success", `Resumed session as ${parsedUser.name}`);
          } catch (e) {
              localStorage.removeItem('serverly_session_user');
              localStorage.removeItem('serverly_session_token');
          }
      }

      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
           await signInWithCustomToken(auth, __initial_auth_token).catch(() => signInAnonymously(auth));
        } else {
           await signInAnonymously(auth);
        }
      } catch (e) { console.error(e); }
    };
    initApp();
    return onAuthStateChanged(auth, (u) => setFirebaseUser(u));
  }, []);

  // --- LISTENERS ---
  useEffect(() => {
    if (!firebaseUser) return;

    const unsubTickets = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'tickets'), (s) => setTickets(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b)=> (b.createdAt?.seconds||0)-(a.createdAt?.seconds||0))));
    const unsubTodos = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'todos'), (s) => setTodos(s.docs.map(d => ({ id: d.id, ...d.data() })).sort((a,b)=> (a.done===b.done?0:a.done?1:-1))));
    const unsubUsers = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'users'), (s) => {
      const usersData = s.docs.map(d => ({ id: d.id, ...d.data() }));
      setUsers(usersData);
      if (currentUser) {
        const me = usersData.find(u => u.id === currentUser.id);
        if (me) setCurrentUser(prev => ({ ...prev, ...me, isWorking: prev.isWorking !== me.isWorking ? me.isWorking : prev.isWorking }));
      }
    });
    const unsubSettings = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'settings'), (s) => { if(!s.empty) { const d=s.docs[0].data(); setSettingsDocId(s.docs[0].id); setGlobalMessage(d.message); setMaintenanceMode(d.maintenance); } });
    const unsubLogs = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'system_logs'), orderBy('createdAt', 'desc'), limit(50)), (s) => setLogs(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubAudit = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'audit_logs'), orderBy('timestamp', 'desc'), limit(50)), (s) => setAuditLogs(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubChat = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'chat_messages'), orderBy('timestamp', 'asc'), limit(200)), (s) => setChatMessages(s.docs.map(d => ({ id: d.id, ...d.data() }))));
    const unsubArticles = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'kb_articles'), (s) => setArticles(s.docs.map(d => ({ id: d.id, ...d.data() }))));

    return () => { unsubTickets(); unsubTodos(); unsubUsers(); unsubSettings(); unsubLogs(); unsubAudit(); unsubChat(); unsubArticles(); };
  }, [firebaseUser]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages, activeTab, chatAttachment]);
  
  useEffect(() => { localStorage.setItem('quick_notes', quickNotes); }, [quickNotes]);

  useEffect(() => {
    if (activeTab === 'monitoring') {
      const i = setInterval(() => setServerStats({ cpu: Math.floor(Math.random()*30)+10, ram: Math.floor(Math.random()*20)+40, net: Math.floor(Math.random()*50)+10 }), 2000);
      return () => clearInterval(i);
    }
  }, [activeTab]);

  // --- ACTIONS ---

  const handleLogin = async (e, username, password, remember) => {
    e.preventDefault();
    setLoginLoading(true); setLoginError("");
    if (!firebaseUser) { setLoginError("System initializing..."); setLoginLoading(false); return; }

    try {
      const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'users'), where('username', '==', username), where('password', '==', password));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const userDoc = snap.docs[0];
        const userData = { id: userDoc.id, ...userDoc.data() };
        setCurrentUser(userData);
        setIsLoggedIn(true);
        addNotification("success", `Welcome back, ${userData.name}`);
        logAudit("USER_LOGIN", `User ${userData.name} logged in`);
        
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', userDoc.id), {
          isOnline: true,
          lastLogin: serverTimestamp()
        });

        if (remember) {
            localStorage.setItem('serverly_session_user', JSON.stringify(userData));
            localStorage.setItem('serverly_session_token', 'valid');
        }
      } else {
        setLoginError("Invalid Credentials.");
        addNotification("error", "Login failed");
      }
    } catch (err) { console.error(err); setLoginError("Login Error."); } 
    finally { setLoginLoading(false); }
  };

  const handleLogout = async () => {
    if (currentUser) {
        if (currentUser.isWorking) toggleWorkShift(); // Auto-end shift
        try {
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', currentUser.id), { isOnline: false });
        } catch(e) { console.warn("Logout update skipped"); }
        logAudit("USER_LOGOUT", `User ${currentUser.name} logged out`);
    }
    localStorage.removeItem('serverly_session_user');
    localStorage.removeItem('serverly_session_token');
    setIsLoggedIn(false); setCurrentUser(null);
  };

  const toggleWorkShift = async () => {
    if (!currentUser) return;
    const now = new Date();
    const isStarting = !currentUser.isWorking;
    
    // Optimistic Update
    setCurrentUser(prev => ({ 
        ...prev, 
        isWorking: isStarting,
        shiftStart: isStarting ? now : null 
    }));

    let updates = { isWorking: isStarting };

    if (isStarting) {
      updates.shiftStart = serverTimestamp();
      addNotification("success", "Shift Started ⏱️");
    } else {
      let startTime = now;
      if (currentUser.shiftStart) {
          startTime = currentUser.shiftStart.toDate ? currentUser.shiftStart.toDate() : new Date(currentUser.shiftStart);
      }
      const durationMs = Math.max(0, now - startTime); 
      const minutesWorked = Math.floor(durationMs / 60000);
      updates.totalWorkMinutes = increment(minutesWorked);
      updates.shiftStart = null;
      addNotification("info", `Shift Ended. Worked: ${formatDuration(durationMs)}`);
      logAudit("WORK_SHIFT", `User ${currentUser.name} ended shift (${formatDuration(durationMs)})`);
    }
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', currentUser.id), updates);
  };

  // Ticket System
  const createTicket = async () => {
    if (!newTicketData.title.trim()) return;
    setShowNewTicketModal(false);
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'tickets'), {
      ...newTicketData,
      status: "Open",
      assignedTo: null,
      createdAt: serverTimestamp(),
      logs: [`Created by ${currentUser.name}`],
      isAutomated: false
    });
    setNewTicketData({ title: "", priority: "Medium", category: "General" });
    addNotification("success", "Ticket Created");
    logAudit("TICKET_CREATE", `Ticket created by ${currentUser.name}`);
  };

  const updateTicketStatus = async (id, newStatus) => {
    let updates = { status: newStatus };
    let msg = `Status changed to ${newStatus}`;
    if (newStatus === "In Progress") {
        updates.assignedTo = currentUser.name;
        updates.claimedAt = serverTimestamp();
        msg = `Claimed by ${currentUser.name}`;
    }
    if (newStatus === "Resolved") {
        updates.resolvedAt = serverTimestamp();
        msg = `Resolved by ${currentUser.name}`;
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', currentUser.id), { ticketsResolved: increment(1) });
    }
    const ticket = tickets.find(t => t.id === id);
    const newLogs = [...(ticket.logs || []), msg];
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tickets', id), { ...updates, logs: newLogs });
    if (selectedTicket?.id === id) setSelectedTicket(prev => ({ ...prev, ...updates, logs: newLogs }));
    addNotification("success", "Ticket Updated");
  };

  const deleteTicket = async (id) => {
    if (currentUser.role !== 'Super Admin' && currentUser.role !== 'Admin') { addNotification("error", "Permission Denied"); return; }
    if (confirm("Permanently delete?")) {
        setSelectedTicket(null);
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tickets', id));
        addNotification("success", "Ticket Deleted");
        logAudit("TICKET_DELETE", `Ticket ${id} deleted by ${currentUser.name}`);
    }
  };

  // KB Actions
  const createArticle = async () => {
    if(!newArticleData.title) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'kb_articles'), { ...newArticleData, author: currentUser.name, createdAt: serverTimestamp() });
    setShowNewArticleModal(false); setNewArticleData({ title: "", category: "General", content: "" });
    addNotification("success", "Article Published");
  };

  const deleteArticle = async (id) => {
      if (currentUser.role === 'Staff') return addNotification("error", "Access Denied");
      if(confirm("Delete this article?")) {
          await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'kb_articles', id));
          addNotification("success", "Article Deleted");
      }
  };

  // --- ENHANCED CHAT SYSTEM ---
  
  // 1. Handle File Upload
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 500000) { // Limit to 500KB for Firestore documents safety
        addNotification("error", "File too large! Max 500KB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setChatAttachment({
          type: 'image',
          data: reader.result, // Base64 string
          name: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // 2. Handle GIF Select
  const sendGif = (url) => {
    sendMessage(null, { type: 'gif', url });
    setShowGifPicker(false);
  };

  // 3. Clear Chat Command
  const clearChat = async () => {
    if (currentUser.role !== 'Super Admin' && currentUser.role !== 'Admin') {
      addNotification("error", "Only Admins can clear chat.");
      return;
    }
    if (confirm("Are you sure you want to delete ALL messages?")) {
      // Since we can't delete collection, we batch delete the visible docs
      const batch = [];
      chatMessages.forEach(msg => {
        // Just triggering individual deletes to stay within simple firestore bounds without complex batch logic import
        deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'chat_messages', msg.id));
      });
      addNotification("success", "Chat Cleared");
      logAudit("CHAT_CLEAR", `Chat cleared by ${currentUser.name}`);
    }
  };

  // 4. Send Message Logic
  const sendMessage = async (textOverride = null, attachmentOverride = null) => {
    const textToSend = textOverride !== null ? textOverride : chatInput;
    const attachmentToSend = attachmentOverride !== null ? attachmentOverride : chatAttachment;

    if (!textToSend?.trim() && !attachmentToSend) return;

    // Admin Command Check
    if (textToSend?.trim() === '/clear') {
      await clearChat();
      setChatInput("");
      return;
    }

    const payload = {
      text: textToSend || "",
      user: currentUser.name,
      userId: currentUser.id,
      role: currentUser.role,
      timestamp: serverTimestamp(),
      type: 'text',
      reactions: {} // { '❤️': ['userId1', 'userId2'] }
    };

    if (attachmentToSend) {
      payload.type = attachmentToSend.type; // 'image' or 'gif'
      payload.attachment = attachmentToSend.data || attachmentToSend.url;
    }

    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'chat_messages'), payload);
    
    setChatInput("");
    setChatAttachment(null);
  };

  // 5. Delete Single Message
  const deleteMessage = async (msgId) => {
    if(confirm("Delete message?")) {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'chat_messages', msgId));
    }
  };

  // 6. React to Message
  const reactToMessage = async (msg, emoji) => {
    const currentReactions = msg.reactions || {};
    const usersWhoReacted = currentReactions[emoji] || [];
    
    let newUsers;
    if (usersWhoReacted.includes(currentUser.id)) {
      newUsers = usersWhoReacted.filter(id => id !== currentUser.id); // Toggle off
    } else {
      newUsers = [...usersWhoReacted, currentUser.id]; // Toggle on
    }

    const updatedReactions = { ...currentReactions, [emoji]: newUsers };
    if (newUsers.length === 0) delete updatedReactions[emoji];

    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'chat_messages', msg.id), {
      reactions: updatedReactions
    });
  };

  // Filter GIFs
  const filteredGifs = useMemo(() => {
     if(!gifSearch) return MOCK_GIFS;
     return MOCK_GIFS.filter(g => g.tags.includes(gifSearch.toLowerCase()));
  }, [gifSearch]);


  const createUser = async () => {
    if (currentUser.role !== 'Super Admin' && currentUser.role !== 'Admin') return;
    setShowNewUserModal(false);
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'users'), { ...newUserData, createdAt: serverTimestamp(), ticketsResolved: 0, totalWorkMinutes: 0, isWorking: false, isOnline: false });
    addNotification("success", "User Created");
    logAudit("USER_CREATE", `User ${newUserData.username} created`);
  };

  const deleteUser = async (id) => {
    if (currentUser.role !== 'Super Admin') { addNotification("error", "Only Super Admins can delete users"); return; }
    if(confirm("Delete user?")) { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', id)); addNotification("success", "User Deleted"); logAudit("USER_DELETE", `User ${id} deleted`); }
  };

  const runGemini = async (mode) => {
    setIsAiLoading(true); setAiOutput(null);
    const prompt = mode === 'plan' ? `Technical plan for: ${selectedTicket.title}` : `Polite reply for: ${selectedTicket.title}`;
    try {
        const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, { method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }) });
        const d = await r.json();
        setAiOutput(d.candidates?.[0]?.content?.parts?.[0]?.text || "No AI output");
    } catch { setAiOutput("AI Error"); } finally { setIsAiLoading(false); }
  };

  const saveSettings = async () => {
      if (!firebaseUser) return;
      const payload = { message: globalMessage, maintenance: maintenanceMode, updatedBy: currentUser?.name, updatedAt: serverTimestamp() };
      if (settingsDocId) await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'settings', settingsDocId), payload);
      else await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'settings'), payload);
      addNotification("success", "Settings Saved");
  };

  // Todo Actions with Edit
  const toggleTodo = async (t) => { if(firebaseUser) await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'todos', t.id), { done: !t.done }); };
  const deleteTodo = async (id) => { if(firebaseUser) await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'todos', id)); };
  const addTodo = async (e) => { 
      if (e.key === 'Enter' && newTodoInput.trim() && firebaseUser) { 
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'todos'), { 
              text: newTodoInput, done: false, createdAt: serverTimestamp(), createdBy: currentUser.name 
          }); 
          setNewTodoInput(""); 
      }
  };
  const startEditingTodo = (t) => { setEditingTodoId(t.id); setEditingTodoText(t.text); };
  const saveTodoEdit = async () => {
      if(editingTodoId) {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'todos', editingTodoId), { text: editingTodoText });
          setEditingTodoId(null);
          addNotification("success", "Task Updated");
      }
  };

  const filteredTickets = useMemo(() => tickets.filter(t => (t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.id.toLowerCase().includes(searchQuery.toLowerCase())) && (filterStatus === "All" || t.status === filterStatus)), [tickets, searchQuery, filterStatus]);

  if (!isLoggedIn) return <LoginScreen onLogin={handleLogin} loading={loginLoading} error={loginError} />;

  return (
    <div className={`flex h-screen font-sans overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-[#0b1121] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* --- TOAST NOTIFICATIONS --- */}
      <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        {notifications.map(n => (
            <div key={n.id} className={`pointer-events-auto px-4 py-3 rounded-lg shadow-2xl flex items-center gap-3 animate-in slide-in-from-right fade-in duration-300 border ${n.type === 'success' ? 'bg-emerald-900/90 border-emerald-500/50 text-emerald-100' : n.type === 'error' ? 'bg-red-900/90 border-red-500/50 text-red-100' : n.type === 'info' ? 'bg-blue-900/90 border-blue-500/50 text-blue-100' : 'bg-slate-800/90 border-slate-600/50 text-slate-100'}`}>
                {n.type === 'success' ? <CheckCircle2 size={18}/> : n.type === 'error' ? <ShieldAlert size={18}/> : <Bell size={18}/>}
                <span className="text-sm font-medium">{n.message}</span>
            </div>
        ))}
      </div>

      {/* --- IMAGE ZOOM OVERLAY --- */}
      {zoomedImage && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-10 cursor-pointer animate-in fade-in" onClick={() => setZoomedImage(null)}>
          <img src={zoomedImage} className="max-w-full max-h-full rounded-lg shadow-2xl" />
          <button className="absolute top-5 right-5 text-white bg-slate-800 rounded-full p-2"><X size={24}/></button>
        </div>
      )}

      {/* --- SIDEBAR --- */}
      <div className={`w-72 border-r flex flex-col shadow-2xl z-20 transition-colors ${darkMode ? 'bg-slate-900/50 border-slate-800/50 backdrop-blur-xl' : 'bg-white border-slate-200'}`}>
        <div className="p-6 border-b border-slate-800/10">
          <h1 className="text-2xl font-black flex items-center gap-3 bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
            <Server size={28} className="text-blue-600" /> SERVERLY
          </h1>
          <div className="flex items-center justify-between mt-4">
             <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full animate-pulse ${currentUser?.isWorking ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{currentUser?.isWorking ? 'On Duty' : 'Off Duty'}</span>
             </div>
             <button onClick={toggleWorkShift} className={`text-[10px] font-bold px-2 py-1 rounded border transition-all ${currentUser?.isWorking ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'}`}>
                {currentUser?.isWorking ? 'END SHIFT' : 'START SHIFT'}
             </button>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto custom-scrollbar">
          <SidebarHeader label="Workflow" darkMode={darkMode} />
          <SidebarBtn icon={<LayoutDashboard size={18} />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} darkMode={darkMode} />
          <SidebarBtn icon={<Terminal size={18} />} label="Tickets" active={activeTab === 'tickets'} onClick={() => setActiveTab('tickets')} darkMode={darkMode} />
          <SidebarBtn icon={<BookOpen size={18} />} label="Knowledge Base" active={activeTab === 'kb'} onClick={() => setActiveTab('kb')} darkMode={darkMode} />
          <SidebarBtn icon={<MessageSquare size={18} />} label="Team Chat" active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} darkMode={darkMode} />
          
          <SidebarHeader label="Management" darkMode={darkMode} />
          <SidebarBtn icon={<Users size={18} />} label="Staff & Users" active={activeTab === 'users'} onClick={() => setActiveTab('users')} darkMode={darkMode} />
          
          {(currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin') && (
            <SidebarBtn icon={<BarChart2 size={18} />} label="Analytics & Reports" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} darkMode={darkMode} />
          )}
          
          <SidebarBtn icon={<Zap size={18} />} label="Monitoring" active={activeTab === 'monitoring'} onClick={() => setActiveTab('monitoring')} darkMode={darkMode} />
          
          {(currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin') && (
            <>
                <SidebarHeader label="Admin Zone" darkMode={darkMode} />
                <SidebarBtn icon={<History size={18} />} label="Audit Logs" active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} darkMode={darkMode} />
                <SidebarBtn icon={<Settings size={18} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} darkMode={darkMode} />
            </>
          )}
        </nav>

        <div className={`p-4 border-t ${darkMode ? 'border-slate-800/50 bg-slate-900/30' : 'border-slate-200 bg-slate-50'}`}>
          <div onClick={() => setShowProfileModal(true)} className={`flex items-center gap-3 mb-4 p-3 rounded-xl border cursor-pointer hover:border-indigo-500/50 transition-all ${darkMode ? 'bg-slate-800/40 border-slate-700/50' : 'bg-white border-slate-200 shadow-sm'}`}>
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-lg">{currentUser?.name?.charAt(0)}</div>
            <div className="overflow-hidden">
              <div className={`text-sm font-bold truncate ${darkMode ? 'text-white' : 'text-slate-800'}`}>{currentUser?.name}</div>
              <div className="text-[10px] text-indigo-500 font-bold uppercase flex items-center gap-1"><Shield size={10}/> {currentUser?.role}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-600 py-3 rounded-xl text-xs font-bold transition-all border border-red-500/10"><LogOut size={14} /> LOGOUT</button>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className={`flex-1 flex flex-col relative ${darkMode ? 'bg-[#0f172a]' : 'bg-slate-100'}`}>
        
        {/* HEADER */}
        <header className={`h-16 border-b backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10 ${darkMode ? 'bg-slate-900/80 border-slate-800/50' : 'bg-white/80 border-slate-200'}`}>
          <div className="flex items-center gap-3">
            <span className="text-slate-500 text-sm font-medium">Console</span><span className="text-slate-400 text-sm">/</span><span className={`font-bold text-lg capitalize ${darkMode ? 'text-white' : 'text-slate-800'}`}>{activeTab}</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowQuickActions(!showQuickActions)} className={`p-2 rounded-full transition-all relative ${darkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>
                <Zap size={18}/>
                {showQuickActions && (
                    <div className="absolute top-12 right-0 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                        <div className="text-xs text-slate-500 font-bold px-2 py-1 uppercase">Quick Actions</div>
                        <button className="w-full text-left text-sm text-slate-300 hover:bg-slate-800 p-2 rounded flex items-center gap-2"><RefreshCw size={14}/> Reboot API</button>
                        <button className="w-full text-left text-sm text-slate-300 hover:bg-slate-800 p-2 rounded flex items-center gap-2"><Trash2 size={14}/> Clear Cache</button>
                    </div>
                )}
            </button>
            <button onClick={() => setDarkMode(!darkMode)} className={`p-2 rounded-full transition-all ${darkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}>
                {darkMode ? <Sun size={18}/> : <Moon size={18}/>}
            </button>
            <div className={`flex items-center gap-3 px-4 py-2 rounded-full border ${darkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-white border-slate-200'}`}>
                <Bell size={16} className="text-indigo-500" /><span className={`text-xs font-medium truncate max-w-[200px] ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{globalMessage || "System normal"}</span>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className={`flex-1 overflow-auto ${activeTab === 'chat' ? 'p-0' : 'p-8 custom-scrollbar'}`}>
          
          {activeTab === 'dashboard' && (
            <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <StatCard title="Tickets Open" value={tickets.filter(t=>t.status==='Open').length} icon={<Terminal className="text-white"/>} gradient="from-blue-600 to-indigo-600" darkMode={darkMode}/>
                <StatCard title="My Resolved" value={currentUser.ticketsResolved || 0} icon={<CheckCircle2 className="text-white"/>} gradient="from-emerald-500 to-teal-600" darkMode={darkMode}/>
                <StatCard title="Work Hours" value={formatDuration((currentUser.totalWorkMinutes || 0) * 60000)} icon={<Clock className="text-white"/>} gradient="from-orange-500 to-amber-600" darkMode={darkMode}/>
                <StatCard title="Active Staff" value={users.filter(u=>u.isOnline).length} icon={<Users className="text-white"/>} gradient="from-violet-500 to-purple-600" darkMode={darkMode}/>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* TASKS */}
                  <div className={`rounded-2xl border p-6 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <h3 className={`font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}><CheckSquare size={18}/> My Tasks & Todos</h3>
                      <div className="space-y-2 max-h-60 overflow-auto">
                        {todos.map(t => (
                            <div key={t.id} className={`flex items-center justify-between p-3 rounded-lg border ${darkMode ? 'border-slate-800 bg-slate-950/50' : 'border-slate-100 bg-slate-50'}`}>
                                <div className="flex items-center gap-3 flex-1">
                                    <button onClick={() => toggleTodo(t)} className={t.done ? 'text-green-500' : 'text-slate-500 hover:text-indigo-500'}>
                                        {t.done ? <CheckCircle2 size={20} /> : <Square size={20} />}
                                    </button>
                                    {editingTodoId === t.id ? (
                                        <input 
                                            className={`flex-1 bg-transparent outline-none border-b border-indigo-500 ${darkMode ? 'text-white' : 'text-slate-900'}`} 
                                            autoFocus
                                            value={editingTodoText} 
                                            onChange={(e) => setEditingTodoText(e.target.value)} 
                                            onKeyDown={(e) => e.key === 'Enter' && saveTodoEdit()} 
                                            onBlur={saveTodoEdit}
                                        />
                                    ) : (
                                        <div className="flex flex-col">
                                            <span className={`text-sm ${t.done ? 'line-through text-slate-500' : (darkMode ? 'text-slate-200' : 'text-slate-800')}`}>{t.text}</span>
                                            {t.createdBy && <span className="text-[10px] text-slate-500">by {t.createdBy}</span>}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => startEditingTodo(t)} className="text-slate-500 hover:text-indigo-400 p-1"><Edit size={14}/></button>
                                    <button onClick={() => deleteTodo(t.id)} className="text-slate-500 hover:text-red-500 p-1"><Trash2 size={14}/></button>
                                </div>
                            </div>
                        ))}
                        <input className={`w-full p-3 rounded-lg border mt-2 outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200'}`} placeholder="+ Add new task..." onKeyDown={addTodo} value={newTodoInput} onChange={e=>setNewTodoInput(e.target.value)} />
                     </div>
                  </div>
                  {/* QUICK NOTES (NEW) */}
                  <div className={`rounded-2xl border p-6 flex flex-col ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                      <h3 className={`font-bold mb-4 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}><StickyNote size={18}/> Quick Notes</h3>
                      <textarea 
                        className={`flex-1 w-full bg-transparent resize-none outline-none ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}
                        placeholder="Type personal notes here..."
                        value={quickNotes}
                        onChange={(e) => setQuickNotes(e.target.value)}
                      />
                      <div className="text-[10px] text-slate-500 text-right mt-2">Saved locally</div>
                  </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (currentUser.role === 'Super Admin' || currentUser.role === 'Admin') && (
            <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <h3 className={`font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}><BarChart2 size={20} className="text-indigo-500"/> Ticket Volume (Last 7 Days)</h3>
                        <div className="flex items-end gap-2 h-48">
                            {[45, 60, 30, 80, 50, 90, 70].map((h, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className={`w-full rounded-t-lg bg-indigo-600/20 group-hover:bg-indigo-600/40 transition-all relative overflow-hidden`} style={{height: `${h}%`}}>
                                        <div className="absolute bottom-0 left-0 w-full bg-indigo-600 transition-all duration-1000" style={{height: `${h/1.5}%`}}></div>
                                    </div>
                                    <span className="text-xs text-slate-500 font-mono">D-{7-i}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <h3 className={`font-bold mb-6 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}><Users size={20} className="text-emerald-500"/> Staff Performance</h3>
                        <div className="space-y-4">
                            {users.slice(0,5).map(u => (
                                <div key={u.id}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className={darkMode ? 'text-slate-300' : 'text-slate-700'}>{u.name}</span>
                                        <span className="text-slate-500">{u.ticketsResolved} solved</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500" style={{width: `${Math.min(100, (u.ticketsResolved || 0) * 2)}%`}}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
          )}

          {activeTab === 'kb' && (
            <div className="max-w-5xl mx-auto animate-in fade-in space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Knowledge Base</h2>
                        <p className="text-slate-500 text-sm">Internal documentation and procedures.</p>
                    </div>
                    {(currentUser.role === 'Super Admin' || currentUser.role === 'Admin') && (
                        <button onClick={() => setShowNewArticleModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Plus size={18}/> New Article</button>
                    )}
                </div>
                <div className="space-y-4">
                    {articles.map(art => (
                        <div key={art.id} className={`border rounded-xl p-4 cursor-pointer transition-all ${darkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:shadow-md'}`} onClick={() => setExpandedArticle(expandedArticle === art.id ? null : art.id)}>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <span className="bg-indigo-500/10 text-indigo-500 px-2 py-1 rounded text-xs font-bold uppercase">{art.category}</span>
                                    <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{art.title}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    {expandedArticle === art.id && (currentUser.role === 'Super Admin' || currentUser.role === 'Admin') && (
                                        <button onClick={(e) => {e.stopPropagation(); deleteArticle(art.id)}} className="text-slate-500 hover:text-red-500"><Trash2 size={16}/></button>
                                    )}
                                    {expandedArticle === art.id ? <ChevronUp size={18} className="text-slate-500"/> : <ChevronRight size={18} className="text-slate-500"/>}
                                </div>
                            </div>
                            {expandedArticle === art.id && (
                                <div className="mt-4 pt-4 border-t border-slate-800/50 text-slate-400 text-sm whitespace-pre-wrap leading-relaxed animate-in fade-in">
                                    {art.content}
                                    <div className="mt-4 text-xs text-slate-600">Author: {art.author} • {timeAgo(art.createdAt)}</div>
                                </div>
                            )}
                        </div>
                    ))}
                    {articles.length === 0 && <div className="text-center text-slate-500 py-10">No articles found. Create one to get started.</div>}
                </div>
            </div>
          )}

          {activeTab === 'settings' && (currentUser.role === 'Super Admin' || currentUser.role === 'Admin') && (
              <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in">
                  <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>System Settings</h2>
                  <div className="flex gap-4 border-b border-slate-700/50 pb-1">
                      {['general', 'security', 'system'].map(tab => (
                          <button key={tab} onClick={() => setSettingsSubTab(tab)} className={`px-4 py-2 text-sm font-bold capitalize transition-colors ${settingsSubTab === tab ? 'text-indigo-500 border-b-2 border-indigo-500' : 'text-slate-500 hover:text-slate-300'}`}>{tab}</button>
                      ))}
                  </div>
                  <div className={`p-8 rounded-2xl border ${darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'}`}>
                      {settingsSubTab === 'general' && (
                          <div className="space-y-6">
                              <div><label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Global Announcement</label><input className={`w-full p-4 rounded-xl border outline-none ${darkMode ? 'bg-slate-950 border-slate-700 text-white' : 'bg-white border-slate-300'}`} value={globalMessage} onChange={(e) => setGlobalMessage(e.target.value)} placeholder="System message..." /></div>
                              <div className="flex items-center gap-2 text-sm text-slate-500"><Globe size={16}/> Language: English (Default)</div>
                          </div>
                      )}
                      {settingsSubTab === 'security' && (
                          <div className="space-y-6">
                              <div className="flex items-center justify-between p-4 bg-slate-950/50 rounded-xl border border-slate-800/50">
                                  <div><div className="font-bold text-white">Maintenance Mode</div><div className="text-xs text-slate-400">Lock access for non-admin users.</div></div>
                                  <button onClick={() => setMaintenanceMode(!maintenanceMode)} className={`relative w-12 h-6 rounded-full transition-all ${maintenanceMode ? 'bg-indigo-600' : 'bg-slate-700'}`}><div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${maintenanceMode ? 'left-7' : 'left-1'}`}></div></button>
                              </div>
                          </div>
                      )}
                      {settingsSubTab === 'system' && (
                          <div className="space-y-6">
                              <button className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-bold text-sm"><Download size={16}/> Export All System Data (JSON)</button>
                          </div>
                      )}
                      <div className="pt-6 mt-6 border-t border-slate-800/50 flex justify-end">
                          <button onClick={saveSettings} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-transform hover:-translate-y-1">Save Changes</button>
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'tickets' && (
            <div className="flex h-full gap-6 animate-in fade-in">
                {/* TICKET LIST / KANBAN */}
                <div className={`${selectedTicket ? 'w-5/12 hidden xl:flex' : 'w-full'} flex flex-col transition-all`}>
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex items-center gap-4">
                            <div className="flex bg-slate-800/50 rounded-lg p-1 border border-slate-700/50">
                                <button onClick={() => setTicketViewMode('list')} className={`p-2 rounded ${ticketViewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}><List size={16}/></button>
                                <button onClick={() => setTicketViewMode('kanban')} className={`p-2 rounded ${ticketViewMode === 'kanban' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}><Layout size={16}/></button>
                            </div>
                            <input className={`bg-transparent border rounded-lg px-4 py-2 text-sm outline-none ${darkMode ? 'border-slate-700 text-white' : 'border-slate-300'}`} placeholder="Search tickets..." value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)} />
                        </div>
                        <button onClick={() => setShowNewTicketModal(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2"><Plus size={16}/> New Ticket</button>
                    </div>

                    {ticketViewMode === 'list' ? (
                        <div className="space-y-3">
                            {filteredTickets.map(t => (
                                <div key={t.id} onClick={() => setSelectedTicket(t)} className={`p-4 rounded-xl border cursor-pointer hover:border-indigo-500/50 transition-all ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'} ${selectedTicket?.id === t.id ? 'border-indigo-500 ring-1 ring-indigo-500/20' : ''}`}>
                                    <div className="flex justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${t.priority === 'Critical' ? 'bg-red-500/10 text-red-500 border-red-500/20 animate-pulse' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>{t.priority}</span>
                                            <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>{t.title}</span>
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded border ${t.status === 'Open' ? 'text-green-500 border-green-500/20' : 'text-slate-500 border-slate-700'}`}>{t.status}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs text-slate-500">
                                        <span>{t.category} • {timeAgo(t.createdAt)}</span>
                                        {t.assignedTo && <span className="flex items-center gap-1 text-indigo-400"><UserCheck size={12}/> {t.assignedTo}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-4 h-full overflow-auto pb-20">
                            {['Open', 'In Progress', 'Resolved'].map(status => (
                                <div key={status} className={`p-4 rounded-xl border flex flex-col gap-3 ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                                    <h3 className={`font-bold text-xs uppercase tracking-wider mb-2 ${status === 'Open' ? 'text-green-500' : status === 'In Progress' ? 'text-amber-500' : 'text-blue-500'}`}>{status} ({filteredTickets.filter(t=>t.status===status).length})</h3>
                                    {filteredTickets.filter(t=>t.status===status).map(t => (
                                        <div key={t.id} onClick={() => setSelectedTicket(t)} className={`p-3 rounded-lg border cursor-pointer hover:-translate-y-1 transition-transform ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200 shadow-sm'}`}>
                                            <div className={`text-sm font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-800'}`}>{t.title}</div>
                                            <div className="flex justify-between items-center">
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded border ${t.priority === 'Critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-slate-800 text-slate-400'}`}>{t.priority}</span>
                                                {t.assignedTo && <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[8px] text-white font-bold">{t.assignedTo.charAt(0)}</div>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* TICKET DETAIL */}
                {selectedTicket && (
                    <div className={`w-full xl:w-7/12 border rounded-2xl flex flex-col shadow-2xl h-[calc(100vh-140px)] animate-in slide-in-from-right ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                        <div className="p-6 border-b border-slate-800/10 flex justify-between">
                            <div>
                                <div className="text-xs text-slate-500 font-mono mb-1">ID: {selectedTicket.id}</div>
                                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{selectedTicket.title}</h2>
                            </div>
                            <button onClick={() => setSelectedTicket(null)}><X size={20} className="text-slate-400 hover:text-slate-200"/></button>
                        </div>
                        <div className="flex-1 p-6 overflow-auto space-y-6">
                            <div className={`p-4 rounded-xl border flex gap-4 ${darkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                                {selectedTicket.status === 'Open' ? (
                                    <button onClick={() => updateTicketStatus(selectedTicket.id, 'In Progress')} className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-bold hover:bg-indigo-500 transition-colors">✋ Claim Ticket</button>
                                ) : selectedTicket.status === 'In Progress' ? (
                                    <button onClick={() => updateTicketStatus(selectedTicket.id, 'Resolved')} className="flex-1 bg-emerald-600 text-white py-2 rounded-lg font-bold hover:bg-emerald-500 transition-colors">✅ Mark Done</button>
                                ) : (
                                    <div className="flex-1 text-center font-bold text-emerald-500 py-2 border border-emerald-500/20 bg-emerald-500/10 rounded-lg">Resolution Complete</div>
                                )}
                            </div>
                            <div className="space-y-3">
                                {selectedTicket.logs?.map((l, i) => (
                                    <div key={i} className={`text-sm p-3 rounded-lg border ${darkMode ? 'bg-slate-800/50 border-slate-700 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                                        <span className="text-indigo-400 font-bold">System:</span> {l}
                                    </div>
                                ))}
                            </div>
                            <div className={`p-4 rounded-xl border ${darkMode ? 'bg-indigo-900/10 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
                                <h4 className="text-indigo-400 font-bold text-xs uppercase mb-2 flex items-center gap-2"><Sparkles size={14}/> AI Assistant</h4>
                                <div className="flex gap-2 mb-3">
                                    <button onClick={() => runGemini('plan')} className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded hover:bg-indigo-500/20">Resolution Plan</button>
                                    <button onClick={() => runGemini('draft')} className="text-xs bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1.5 rounded hover:bg-purple-500/20">Draft Reply</button>
                                </div>
                                {isAiLoading && <div className="text-xs text-slate-500 animate-pulse">Thinking...</div>}
                                {aiOutput && <div className="text-xs font-mono text-slate-400 whitespace-pre-wrap">{aiOutput}</div>}
                            </div>
                            {(currentUser?.role === 'Super Admin' || currentUser?.role === 'Admin') && (
                                <div className="pt-6 border-t border-red-500/20">
                                    <button onClick={() => deleteTicket(selectedTicket.id)} className="text-red-500 text-xs font-bold hover:underline flex items-center gap-1"><Trash2 size={12}/> Permanently Delete Ticket</button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
          )}

          {activeTab === 'chat' && (
            <div className={`h-full flex flex-col relative ${darkMode ? 'bg-[#0f172a]' : 'bg-white'}`}>
                {/* Chat Header */}
                <div className={`h-16 flex items-center justify-between px-6 border-b z-20 ${darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'} backdrop-blur-lg`}>
                   <div className="flex items-center gap-3">
                       <div className="p-2 bg-indigo-600 rounded-lg text-white shadow-lg shadow-indigo-500/20"><MessageSquare size={20}/></div>
                       <div>
                           <h2 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>Team Hub</h2>
                           <div className="flex items-center gap-2 text-xs text-emerald-500 font-medium"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"/> {users.filter(u=>u.isOnline).length} Online</div>
                       </div>
                   </div>
                   {(currentUser.role === 'Admin' || currentUser.role === 'Super Admin') && (
                        <div className="text-[10px] text-slate-500 bg-slate-800/50 px-2 py-1 rounded border border-slate-700">Type <b>/clear</b> to wipe chat</div>
                   )}
                </div>

                {/* Messages Area */}
                <div className={`flex-1 overflow-y-auto p-6 space-y-6 ${darkMode ? 'bg-gradient-to-br from-[#0f172a] to-[#1e293b]' : 'bg-slate-50'}`}>
                    {chatMessages.map((msg, idx) => {
                        const isMe = msg.user === currentUser.name;
                        const isSystem = msg.type === 'system';
                        const showAvatar = idx === 0 || chatMessages[idx-1].user !== msg.user;

                        return (
                            <div key={msg.id} className={`flex gap-4 group ${isMe ? 'flex-row-reverse' : ''} ${!showAvatar ? 'mt-1' : 'mt-4'}`}>
                                {showAvatar ? (
                                    <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-bold text-white shadow-lg ${isMe ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                                        {msg.user.charAt(0)}
                                    </div>
                                ) : <div className="w-10"/>}

                                <div className={`max-w-[70%] relative`}>
                                    {showAvatar && <div className={`text-xs font-bold mb-1 opacity-70 ${isMe ? 'text-right' : ''}`}>{msg.user} <span className="font-normal opacity-50">• {timeAgo(msg.timestamp)}</span></div>}
                                    
                                    <div className={`p-3 rounded-2xl shadow-sm text-sm relative border transition-all hover:shadow-md
                                        ${isMe 
                                            ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white border-indigo-500/50 rounded-tr-sm' 
                                            : (darkMode ? 'bg-slate-800 text-slate-200 border-slate-700 rounded-tl-sm' : 'bg-white text-slate-800 border-slate-200 rounded-tl-sm')}
                                        ${msg.type === 'image' || msg.type === 'gif' ? 'p-1 overflow-hidden' : ''}
                                    `}>
                                        {msg.type === 'text' && msg.text}
                                        {(msg.type === 'image' || msg.type === 'gif') && (
                                            <img 
                                                src={msg.attachment} 
                                                className="rounded-xl max-w-full max-h-[300px] object-cover cursor-zoom-in hover:scale-[1.02] transition-transform"
                                                onClick={() => setZoomedImage(msg.attachment)}
                                            />
                                        )}
                                        
                                        {/* Reactions Display */}
                                        {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                                            <div className="flex gap-1 mt-2 -mb-5 flex-wrap">
                                                {Object.entries(msg.reactions).map(([emoji, userIds]) => (
                                                    <button key={emoji} onClick={() => reactToMessage(msg, emoji)} className={`text-[10px] px-1.5 py-0.5 rounded-full border shadow-sm transition-transform hover:scale-110 ${userIds.includes(currentUser.id) ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-slate-700 text-slate-300 border-slate-600'}`}>
                                                        {emoji} {userIds.length}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Actions (Hover) */}
                                    <div className={`absolute top-0 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? 'left-0 -translate-x-full pr-2' : 'right-0 translate-x-full pl-2'}`}>
                                        <div className="bg-slate-800 rounded-full border border-slate-700 flex shadow-xl">
                                            <button onClick={() => reactToMessage(msg, '👍')} className="p-1.5 hover:bg-slate-700 rounded-full text-xs">👍</button>
                                            <button onClick={() => reactToMessage(msg, '❤️')} className="p-1.5 hover:bg-slate-700 rounded-full text-xs">❤️</button>
                                            <button onClick={() => reactToMessage(msg, '😂')} className="p-1.5 hover:bg-slate-700 rounded-full text-xs">😂</button>
                                        </div>
                                        {(isMe || currentUser.role === 'Super Admin') && (
                                            <button onClick={() => deleteMessage(msg.id)} className="p-1.5 bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white rounded-full transition-colors"><Trash2 size={12}/></button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                    <div ref={chatEndRef} />
                </div>

                {/* Input Area */}
                <div className={`p-4 border-t z-20 ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    
                    {/* Attachment Preview */}
                    {chatAttachment && (
                        <div className="mb-3 p-3 bg-slate-800 rounded-xl border border-slate-700 flex items-center justify-between animate-in slide-in-from-bottom">
                            <div className="flex items-center gap-3">
                                {chatAttachment.type === 'image' ? (
                                    <img src={chatAttachment.data} className="w-12 h-12 object-cover rounded-lg border border-slate-600"/>
                                ) : (
                                    <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center text-indigo-500"><File size={20}/></div>
                                )}
                                <div>
                                    <div className="text-sm font-bold text-white truncate max-w-[200px]">{chatAttachment.name}</div>
                                    <div className="text-xs text-slate-400">Ready to send</div>
                                </div>
                            </div>
                            <button onClick={() => setChatAttachment(null)} className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-white"><X size={18}/></button>
                        </div>
                    )}

                    {/* GIF Picker Popover */}
                    {showGifPicker && (
                         <div className="absolute bottom-24 left-4 w-72 h-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col z-50 animate-in zoom-in-95">
                             <div className="p-3 border-b border-slate-800">
                                 <input autoFocus className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white outline-none" placeholder="Search GIFs..." value={gifSearch} onChange={e=>setGifSearch(e.target.value)} />
                             </div>
                             <div className="flex-1 overflow-y-auto p-2 grid grid-cols-2 gap-2">
                                 {filteredGifs.map(g => (
                                     <img key={g.id} src={g.url} className="w-full h-24 object-cover rounded cursor-pointer hover:ring-2 ring-indigo-500 transition-all" onClick={() => sendGif(g.url)} />
                                 ))}
                             </div>
                         </div>
                    )}

                    <div className="flex items-end gap-3">
                        <input type="file" ref={fileInputRef} hidden accept="image/*" onChange={handleFileSelect} />
                        
                        <div className={`flex-1 rounded-2xl border flex items-center gap-2 p-2 ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'}`}>
                            <button onClick={() => fileInputRef.current.click()} className="p-2 rounded-full text-slate-400 hover:text-indigo-500 hover:bg-slate-800 transition-colors"><ImageIcon size={20}/></button>
                            <button onClick={() => setShowGifPicker(!showGifPicker)} className={`p-2 rounded-full transition-colors ${showGifPicker ? 'text-pink-500 bg-pink-500/10' : 'text-slate-400 hover:text-pink-500 hover:bg-slate-800'}`}><Smile size={20}/></button>
                            <input 
                                className={`flex-1 bg-transparent outline-none max-h-32 py-2 ${darkMode ? 'text-white placeholder:text-slate-600' : 'text-slate-900'}`} 
                                placeholder="Type a message..." 
                                value={chatInput} 
                                onChange={e=>setChatInput(e.target.value)} 
                                onKeyDown={e=>e.key==='Enter' && sendMessage()} 
                            />
                        </div>
                        <button 
                            onClick={() => sendMessage()} 
                            className={`p-4 rounded-2xl transition-all shadow-lg flex items-center justify-center
                            ${chatInput.trim() || chatAttachment ? 'bg-indigo-600 hover:bg-indigo-500 text-white scale-100' : 'bg-slate-800 text-slate-500 cursor-not-allowed scale-95'}`}
                        >
                            <Send size={20} className={chatInput.trim() || chatAttachment ? "fill-white" : ""}/>
                        </button>
                    </div>
                </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in">
                <div className={`col-span-full flex justify-between items-center mb-4`}>
                    <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Staff Directory</h2>
                    {(currentUser.role === 'Super Admin' || currentUser.role === 'Admin') && (
                        <button onClick={() => setShowNewUserModal(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"><UserPlus size={18}/> Add Staff</button>
                    )}
                </div>
                {users.map(u => (
                    <div key={u.id} className={`p-6 rounded-2xl border relative overflow-hidden group ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">{u.name.charAt(0)}</div>
                            <div>
                                <div className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-900'}`}>{u.name}</div>
                                <div className="text-xs text-slate-500 font-medium uppercase">{u.role}</div>
                            </div>
                        </div>
                        <div className={`absolute top-4 right-4 px-2 py-1 rounded text-[10px] font-bold uppercase border ${u.isOnline ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
                            {u.isOnline ? 'Online' : 'Offline'}
                        </div>
                        <div className="space-y-3 mt-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Tickets Solved</span>
                                <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{u.ticketsResolved || 0}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Total Worktime</span>
                                <span className={`font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{formatDuration((u.totalWorkMinutes || 0) * 60000)}</span>
                            </div>
                        </div>
                        {currentUser.role === 'Super Admin' && (
                            <button onClick={() => deleteUser(u.id)} className="mt-6 w-full py-2 rounded-lg border border-red-500/20 text-red-500 text-xs font-bold hover:bg-red-500/10 transition-colors">REMOVE USER</button>
                        )}
                    </div>
                ))}
            </div>
          )}

          {activeTab === 'audit' && (currentUser.role === 'Super Admin' || currentUser.role === 'Admin') && (
            <div className={`rounded-2xl border overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}>
                <div className="p-4 border-b border-slate-800/10 font-bold">Security Audit Log</div>
                <table className="w-full text-left text-sm">
                    <thead className={`uppercase text-xs font-bold ${darkMode ? 'bg-slate-950 text-slate-500' : 'bg-slate-50 text-slate-500'}`}>
                        <tr><th className="p-4">Action</th><th className="p-4">User</th><th className="p-4">Details</th><th className="p-4">Time</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/10">
                        {auditLogs.map(l => (
                            <tr key={l.id} className="hover:bg-slate-500/5">
                                <td className="p-4 font-mono text-xs text-indigo-500">{l.action}</td>
                                <td className="p-4 font-bold">{l.user} <span className="text-[10px] text-slate-500 font-normal border px-1 rounded ml-1">{l.role}</span></td>
                                <td className="p-4 text-slate-500">{l.details}</td>
                                <td className="p-4 text-slate-500 text-xs">{timeAgo(l.timestamp)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          )}

          {activeTab === 'monitoring' && (
            <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="col-span-2 bg-slate-900/60 border border-slate-800/60 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2"><Zap size={20} className="text-yellow-500"/> Live Server Metrics</h3>
                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between mb-2 text-sm font-bold text-slate-400"><span>CPU Load</span> <span className="text-white">{serverStats.cpu}%</span></div>
                                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-blue-500 transition-all duration-500 ease-out" style={{ width: `${serverStats.cpu}%` }}></div></div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-2 text-sm font-bold text-slate-400"><span>Memory Usage</span> <span className="text-white">{serverStats.ram}%</span></div>
                                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-purple-500 transition-all duration-500 ease-out" style={{ width: `${serverStats.ram}%` }}></div></div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-2 text-sm font-bold text-slate-400"><span>Network Traffic</span> <span className="text-white">{serverStats.net} MB/s</span></div>
                                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-green-500 transition-all duration-500 ease-out" style={{ width: `${serverStats.net}%` }}></div></div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-900/60 border border-slate-800/60 rounded-2xl p-6 shadow-xl">
                        <h3 className="font-bold text-white text-lg mb-4">Raw System Stream</h3>
                        <div className="font-mono text-xs text-slate-400 bg-slate-950 p-4 rounded-xl h-48 overflow-auto border border-slate-800">
                            {logs.map(log => (<div key={log.id} className="mb-1 border-b border-slate-800/50 pb-1 last:border-0"><span className="text-slate-600">[{log.createdAt?.seconds}]</span> <span className={log.level === 'ERROR' ? 'text-red-500 font-bold' : 'text-blue-400'}>{log.level}</span>: {log.message}</div>))}
                        </div>
                    </div>
                </div>
            </div>
          )}

        </main>
      </div>

      {/* --- MODALS --- */}
      {showNewTicketModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className={`w-full max-w-md rounded-2xl p-8 shadow-2xl relative ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
                <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>New Support Ticket</h3>
                <input className={`w-full p-3 rounded-lg border mb-4 outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200'}`} placeholder="Subject" value={newTicketData.title} onChange={e => setNewTicketData({...newTicketData, title: e.target.value})} />
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <select className={`p-3 rounded-lg border outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200'}`} value={newTicketData.priority} onChange={e=>setNewTicketData({...newTicketData, priority: e.target.value})}><option>Low</option><option>Medium</option><option>High</option><option>Critical</option></select>
                    <select className={`p-3 rounded-lg border outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200'}`} value={newTicketData.category} onChange={e=>setNewTicketData({...newTicketData, category: e.target.value})}><option>General</option><option>Network</option><option>Database</option></select>
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={() => setShowNewTicketModal(false)} className="px-4 py-2 text-slate-500 font-bold hover:text-slate-300">Cancel</button>
                    <button onClick={createTicket} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-500">Create Ticket</button>
                </div>
            </div>
        </div>
      )}

      {showNewUserModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className={`w-full max-w-md rounded-2xl p-8 shadow-2xl ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
                <h3 className={`text-xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-slate-900'}`}>Add New Staff</h3>
                <p className="text-slate-500 text-sm mb-6">Staff members have restricted access.</p>
                <div className="space-y-4 mb-6">
                    <input className={`w-full p-3 rounded-lg border outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200'}`} placeholder="Full Name" value={newUserData.name} onChange={e=>setNewUserData({...newUserData, name: e.target.value})} />
                    <input className={`w-full p-3 rounded-lg border outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200'}`} placeholder="Username" value={newUserData.username} onChange={e=>setNewUserData({...newUserData, username: e.target.value})} />
                    <input className={`w-full p-3 rounded-lg border outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200'}`} type="password" placeholder="Password" value={newUserData.password} onChange={e=>setNewUserData({...newUserData, password: e.target.value})} />
                    <div className="flex gap-2">
                        <button onClick={()=>setNewUserData({...newUserData, role: 'Staff'})} className={`flex-1 py-2 rounded border font-bold text-sm ${newUserData.role === 'Staff' ? 'bg-indigo-600 text-white border-indigo-600' : 'text-slate-500 border-slate-700'}`}>Staff</button>
                        <button onClick={()=>setNewUserData({...newUserData, role: 'Admin'})} className={`flex-1 py-2 rounded border font-bold text-sm ${newUserData.role === 'Admin' ? 'bg-indigo-600 text-white border-indigo-600' : 'text-slate-500 border-slate-700'}`}>Admin</button>
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={() => setShowNewUserModal(false)} className="px-4 py-2 text-slate-500 font-bold">Cancel</button>
                    <button onClick={createUser} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-500">Create Account</button>
                </div>
            </div>
        </div>
      )}

      {showNewArticleModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className={`w-full max-w-lg rounded-2xl p-8 shadow-2xl ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
                <h3 className={`text-xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>New Knowledge Base Article</h3>
                <div className="space-y-4 mb-6">
                    <input className={`w-full p-3 rounded-lg border outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200'}`} placeholder="Article Title" value={newArticleData.title} onChange={e=>setNewArticleData({...newArticleData, title: e.target.value})} />
                    <select className={`w-full p-3 rounded-lg border outline-none ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200'}`} value={newArticleData.category} onChange={e=>setNewArticleData({...newArticleData, category: e.target.value})}>
                        <option>General</option><option>Technical</option><option>Troubleshooting</option><option>Policy</option>
                    </select>
                    <textarea className={`w-full p-3 rounded-lg border outline-none h-32 ${darkMode ? 'bg-slate-950 border-slate-800 text-white' : 'bg-white border-slate-200'}`} placeholder="Content..." value={newArticleData.content} onChange={e=>setNewArticleData({...newArticleData, content: e.target.value})} />
                </div>
                <div className="flex justify-end gap-3">
                    <button onClick={() => setShowNewArticleModal(false)} className="px-4 py-2 text-slate-500 font-bold">Cancel</button>
                    <button onClick={createArticle} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-500">Publish Article</button>
                </div>
            </div>
        </div>
      )}

      {showProfileModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className={`w-full max-w-sm rounded-2xl p-8 shadow-2xl ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
                <div className="text-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-indigo-600 mx-auto flex items-center justify-center text-3xl font-bold text-white mb-3 shadow-lg">{currentUser.name.charAt(0)}</div>
                    <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{currentUser.name}</h3>
                    <p className="text-indigo-500 font-bold text-sm uppercase">{currentUser.role}</p>
                </div>
                <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-sm p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                        <span className="text-slate-400">Total Shifts</span>
                        <span className="text-white font-bold">{Math.floor((currentUser.totalWorkMinutes || 0) / 60)}h</span>
                    </div>
                    <div className="flex justify-between text-sm p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                        <span className="text-slate-400">Tickets Solved</span>
                        <span className="text-white font-bold">{currentUser.ticketsResolved || 0}</span>
                    </div>
                </div>
                <button onClick={() => setShowProfileModal(false)} className="w-full py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700">Close Profile</button>
            </div>
        </div>
      )}

    </div>
  );
}

// --- SUB-COMPONENTS ---

function LoginScreen({ onLogin, loading, error }) {
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [remember, setRemember] = useState(false);

  useEffect(() => {
      const saved = localStorage.getItem('saved_username');
      if (saved) {
          setU(saved);
          setRemember(true);
      }
  }, []);

  return (
    <div className="flex h-screen bg-[#050b14] items-center justify-center relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="bg-slate-900/60 backdrop-blur-2xl p-12 rounded-3xl border border-slate-700/50 w-[450px] shadow-2xl z-10">
        <div className="flex justify-center mb-8"><div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-5 rounded-2xl shadow-lg shadow-blue-500/20"><Server size={40} className="text-white" /></div></div>
        <h2 className="text-3xl font-black text-center mb-2 text-white">Serverly Admin</h2>
        <p className="text-slate-400 text-center mb-10 text-sm font-medium">Secure Enterprise Access</p>
        <form onSubmit={(e) => onLogin(e, u, p, remember)} className="space-y-5">
          <input className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl p-4 text-white focus:border-blue-500 outline-none" value={u} onChange={e => setU(e.target.value)} placeholder="Username" />
          <input type="password" className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl p-4 text-white focus:border-blue-500 outline-none" value={p} onChange={e => setP(e.target.value)} placeholder="Password" />
          
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setRemember(!remember)}>
              <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${remember ? 'bg-blue-600 border-blue-600' : 'bg-transparent border-slate-600'}`}>
                  {remember && <CheckCircle2 size={14} className="text-white"/>}
              </div>
              <span className="text-sm text-slate-400">Stay Logged In</span>
          </div>

          {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-xs font-bold text-center">{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg mt-6 flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">{loading ? <RefreshCw className="animate-spin" size={20}/> : 'Authenticate Session'}</button>
        </form>
      </div>
    </div>
  );
}

function SidebarBtn({ icon, label, active, onClick, darkMode }) { return <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-1 group ${active ? 'bg-blue-600/10 text-blue-500 border border-blue-600/20' : darkMode ? 'text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent'}`}><div className={`${active ? 'text-blue-500' : darkMode ? 'text-slate-500 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-600'}`}>{icon}</div><span className="font-bold text-sm tracking-wide">{label}</span></button>; }
function SidebarHeader({ label, darkMode }) { return <div className={`px-4 pb-2 pt-6 text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-slate-600' : 'text-slate-400'}`}>{label}</div>; }
function StatCard({ title, value, icon, gradient, darkMode }) { return <div className={`p-6 rounded-2xl border relative overflow-hidden group ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'}`}><div className={`absolute top-0 right-0 p-24 bg-gradient-to-br ${gradient} opacity-5 rounded-full blur-2xl group-hover:opacity-10 transition-opacity translate-x-10 -translate-y-10`}></div><div className="flex justify-between items-start mb-4 relative z-10"><div className={`text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{title}</div><div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg`}>{icon}</div></div><div className={`text-3xl font-black relative z-10 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{value}</div></div>; }