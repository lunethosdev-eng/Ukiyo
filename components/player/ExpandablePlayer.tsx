// Reemplaza la línea del hook usePlayback por esta:
const { currentTrack, isPlaying, pause, resume, position, duration } = usePlayback();

// Y crea una función para manejar el toggle:
const handlePlayPause = () => isPlaying ? pause() : resume();

// ... más abajo, actualiza tu ScrollView ...

<ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
  <View style={styles.coverContainer}>
    <Image source={{ uri: currentTrack.artwork }} style={styles.fullArt} />
  </View>

  <View style={styles.infoRow}>
    <View style={styles.titleArea}>
      <Text style={styles.fullTitle} numberOfLines={2}>{currentTrack.title}</Text>
      <Text style={styles.fullArtist}>{currentTrack.artist}</Text>
    </View>
    <Pressable style={[styles.followBtn, isFollowing && styles.followingBtn]} onPress={() => setIsFollowing(!isFollowing)}>
      <Text style={styles.followText}>{isFollowing ? "Siguiendo" : "Seguir"}</Text>
    </Pressable>
  </View>

  {/* LYRICS ARRIBA DE LOS CONTROLES (Estilo Apple Music) */}
  <Pressable onPress={openKaraoke} style={{ marginBottom: 30 }}>
    <LiquidGlass intensity={30} borderRadius={20} style={styles.lyricsBox}>
      <View style={styles.lyricsHeader}>
        <Text style={styles.lyricsTitle}>Letras</Text>
        <Ionicons name="expand" size={18} color="rgba(255,255,255,0.6)" />
      </View>
      <Text style={styles.lyricsPreview}>
        Toca aquí para ver las letras sincronizadas...
      </Text>
    </LiquidGlass>
  </Pressable>

  <View style={styles.barTrack}>
    <View style={[styles.barFill, { width: `${progress * 100}%` }]} />
  </View>

  <View style={styles.controls}>
    {/* Botones Next/Prev agregados y funcionando visualmente */}
    <Pressable hitSlop={20}>
      <Ionicons name="play-back-sharp" size={36} color="#fff" />
    </Pressable>
    
    <Pressable onPress={handlePlayPause} style={styles.playBtn}>
      <Ionicons name={isPlaying ? "pause" : "play"} size={36} color="#0c0c0e" />
    </Pressable>
    
    <Pressable hitSlop={20}>
      <Ionicons name="play-forward-sharp" size={36} color="#fff" />
    </Pressable>
  </View>
</ScrollView>
