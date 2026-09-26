export default function ActiveEmergencyScreen({ route, navigation }) {
  const { sos } = route.params;
  const [region, setRegion] = useState({
    latitude: sos.coordinates.latitude,
    longitude: sos.coordinates.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    const interval = setInterval(async () => {
      const loc = await getCurrentLocation();
      setRegion((r) => ({ ...r, latitude: loc.latitude, longitude: loc.longitude }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleImSafe = () => {
    Alert.alert("Confirm", "Mark this emergency as resolved?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "I'm safe now",
        style: "destructive",
        onPress: async () => {
          await resolveSOS(sos._id).catch(() => {});
          navigation.popToTop();
        },
      },
    ]);
  };

  return 
