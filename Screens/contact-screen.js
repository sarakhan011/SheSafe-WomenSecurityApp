export default function ContactsScreen() {
  const { user, setUser } = useAuth();
  const [contacts, setContacts] = useState(user?.emergency_contact || []);
  const [form, setForm] = useState({ name: "", phone_number: "", relationship: "" });

  const refresh = async () => {
    const { data } = await getProfile();
    setUser(data.user);
    setContacts(data.user.emergency_contact || []);
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleAdd = async () => {
    if (!form.name || !form.phone_number) {
      return Alert.alert("Missing info", "Name and phone number are required");
    }
    try {
      await addContact(form);
      setForm({ name: "", phone_number: "", relationship: "" });
      refresh();
    } catch (err) {
      Alert.alert("Failed to add contact", err.response?.data?.message || "Try again");
    }
  };

  const handleDelete = async (contactId) => {
    await removeContact(contactId);
    refresh();
  };

  return 
    
