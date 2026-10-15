import { WhatsAppChat } from '../types';

export const MOCK_CHATS: WhatsAppChat[] = [
  {
    id: 'chat-1', contactName: 'Rohit Sharma', phoneNumber: '+91 98765 43210', companyName: 'Reliance Retail', unreadCount: 2, lastMessageTime: '10:45 AM', isOnline: true,
    messages: [
      { id: 'm1', senderId: 'me', text: 'Hi Rohit, did you get a chance to review the CRM proposal?', timestamp: 'Yesterday', isMe: true, status: 'read' },
      { id: 'm2', senderId: 'them', text: 'Yes, looking at it now. Can we do a quick call at 3 PM?', timestamp: '10:42 AM', isMe: false },
      { id: 'm3', senderId: 'them', text: 'Also, what is the pricing for the Enterprise plan in INR?', timestamp: '10:45 AM', isMe: false },
    ]
  },
  {
    id: 'chat-2', contactName: 'Priya Patel', phoneNumber: '+91 91234 56789', companyName: 'TCS', unreadCount: 0, lastMessageTime: 'Yesterday', isOnline: false,
    messages: [
      { id: 'm1', senderId: 'them', text: 'Please send the invoice for last month.', timestamp: 'Yesterday', isMe: false },
      { id: 'm2', senderId: 'me', text: 'Sure Priya, I have emailed you the invoice of ₹45,000 for August.', timestamp: 'Yesterday', isMe: true, status: 'read' },
      { id: 'm3', senderId: 'them', text: 'Received, thanks!', timestamp: 'Yesterday', isMe: false },
    ]
  },
  {
    id: 'chat-3', contactName: 'Amit Kumar', phoneNumber: '+91 99887 76655', companyName: 'Zomato', unreadCount: 1, lastMessageTime: '09:15 AM', isOnline: true,
    messages: [
      { id: 'm1', senderId: 'me', text: 'Hi Amit, following up on the payment integration.', timestamp: 'Monday', isMe: true, status: 'read' },
      { id: 'm2', senderId: 'them', text: 'Our tech team is still reviewing the API docs. Give us 2 more days.', timestamp: '09:15 AM', isMe: false },
    ]
  },
  {
    id: 'chat-4', contactName: 'Neha Gupta', phoneNumber: '+91 98712 34567', companyName: 'Infosys', unreadCount: 0, lastMessageTime: 'Last Week', isOnline: false,
    messages: [
      { id: 'm1', senderId: 'me', text: 'Happy Diwali Neha! Wishing you and the Infosys team a great year ahead.', timestamp: 'Last Week', isMe: true, status: 'read' },
      { id: 'm2', senderId: 'them', text: 'Thank you so much! Same to you.', timestamp: 'Last Week', isMe: false },
    ]
  },
  {
    id: 'chat-5', contactName: 'Vikram Singh', phoneNumber: '+91 99988 77766', companyName: 'Delhivery', unreadCount: 5, lastMessageTime: '08:30 AM', isOnline: true,
    messages: [
      { id: 'm1', senderId: 'them', text: 'We need to upgrade our plan to Enterprise.', timestamp: '08:30 AM', isMe: false },
    ]
  },
  {
    id: 'chat-6', contactName: 'Anjali Desai', phoneNumber: '+91 98765 11111', companyName: 'Nykaa', unreadCount: 0, lastMessageTime: 'Monday', isOnline: false,
    messages: [
      { id: 'm1', senderId: 'them', text: 'The new workflow automation feature is great!', timestamp: 'Monday', isMe: false },
    ]
  },
  {
    id: 'chat-7', contactName: 'Sanjay Kapoor', phoneNumber: '+91 91234 22222', companyName: 'Oyo Rooms', unreadCount: 0, lastMessageTime: 'Friday', isOnline: false,
    messages: [
      { id: 'm1', senderId: 'me', text: 'Are we still on for the demo tomorrow?', timestamp: 'Friday', isMe: true, status: 'read' },
    ]
  },
  {
    id: 'chat-8', contactName: 'Meera Reddy', phoneNumber: '+91 99887 33333', companyName: 'Swiggy', unreadCount: 1, lastMessageTime: '11:20 AM', isOnline: true,
    messages: [
      { id: 'm1', senderId: 'them', text: 'Can we add 5 more users to our account?', timestamp: '11:20 AM', isMe: false },
    ]
  },
  {
    id: 'chat-9', contactName: 'Rahul Verma', phoneNumber: '+91 98712 44444', companyName: 'Paytm', unreadCount: 0, lastMessageTime: '2 days ago', isOnline: true,
    messages: [
      { id: 'm1', senderId: 'them', text: 'Payment cleared from our side.', timestamp: '2 days ago', isMe: false },
    ]
  },
  {
    id: 'chat-10', contactName: 'Kavita Joshi', phoneNumber: '+91 99988 55555', companyName: 'MakeMyTrip', unreadCount: 0, lastMessageTime: '1 week ago', isOnline: false,
    messages: [
      { id: 'm1', senderId: 'me', text: 'Thanks for choosing KeroCRM!', timestamp: '1 week ago', isMe: true, status: 'read' },
    ]
  },
  {
    id: 'chat-11', contactName: 'Arjun Nair', phoneNumber: '+91 98765 66666', companyName: 'Flipkart', unreadCount: 3, lastMessageTime: '09:00 AM', isOnline: true,
    messages: [
      { id: 'm1', senderId: 'them', text: 'We are facing a slight issue with the API rate limits.', timestamp: '09:00 AM', isMe: false },
    ]
  },
  {
    id: 'chat-12', contactName: 'Sneha Rao', phoneNumber: '+91 91234 77777', companyName: 'Ola Cabs', unreadCount: 0, lastMessageTime: 'Yesterday', isOnline: false,
    messages: [
      { id: 'm1', senderId: 'them', text: 'Got it, thanks.', timestamp: 'Yesterday', isMe: false },
    ]
  },
  {
    id: 'chat-13', contactName: 'Manoj Tiwari', phoneNumber: '+91 99887 88888', companyName: 'Cred', unreadCount: 0, lastMessageTime: 'Tuesday', isOnline: false,
    messages: [
      { id: 'm1', senderId: 'me', text: 'Let me know if you need help with the onboarding.', timestamp: 'Tuesday', isMe: true, status: 'read' },
    ]
  },
  {
    id: 'chat-14', contactName: 'Pooja Mehta', phoneNumber: '+91 98712 99999', companyName: 'Urban Company', unreadCount: 1, lastMessageTime: '12:45 PM', isOnline: true,
    messages: [
      { id: 'm1', senderId: 'them', text: 'Could you share the documentation for the webhooks?', timestamp: '12:45 PM', isMe: false },
    ]
  },
  {
    id: 'chat-15', contactName: 'Karan Singh', phoneNumber: '+91 99988 00000', companyName: 'Lenskart', unreadCount: 0, lastMessageTime: '3 days ago', isOnline: true,
    messages: [
      { id: 'm1', senderId: 'them', text: 'All good now, the issue is resolved.', timestamp: '3 days ago', isMe: false },
    ]
  },
  {
    id: 'chat-16', contactName: 'Divya Iyer', phoneNumber: '+91 98765 12345', companyName: 'Razorpay', unreadCount: 0, lastMessageTime: 'Last month', isOnline: false,
    messages: [
      { id: 'm1', senderId: 'me', text: 'Please find the attached agreement.', timestamp: 'Last month', isMe: true, status: 'read' },
    ]
  },
  {
    id: 'chat-17', contactName: 'Sunil Gavaskar', phoneNumber: '+91 91234 54321', companyName: 'Unacademy', unreadCount: 2, lastMessageTime: '07:30 AM', isOnline: true,
    messages: [
      { id: 'm1', senderId: 'them', text: 'Our team loves the new AI features.', timestamp: '07:30 AM', isMe: false },
    ]
  },
  {
    id: 'chat-18', contactName: 'Ritu Phogat', phoneNumber: '+91 99887 67890', companyName: 'Dream11', unreadCount: 0, lastMessageTime: 'Yesterday', isOnline: false,
    messages: [
      { id: 'm1', senderId: 'them', text: 'Sure, let us connect next week.', timestamp: 'Yesterday', isMe: false },
    ]
  },
  {
    id: 'chat-19', contactName: 'Gaurav Taneja', phoneNumber: '+91 98712 09876', companyName: 'ClearTax', unreadCount: 1, lastMessageTime: '02:15 PM', isOnline: true,
    messages: [
      { id: 'm1', senderId: 'them', text: 'Do you have a feature to export reports as PDF?', timestamp: '02:15 PM', isMe: false },
    ]
  },
  {
    id: 'chat-20', contactName: 'Aarti Chhabria', phoneNumber: '+91 99988 13579', companyName: 'Upstox', unreadCount: 0, lastMessageTime: 'Friday', isOnline: false,
    messages: [
      { id: 'm1', senderId: 'me', text: 'Your account has been successfully verified.', timestamp: 'Friday', isMe: true, status: 'delivered' },
    ]
  }
];
