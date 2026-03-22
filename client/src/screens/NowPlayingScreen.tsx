import React from 'react';
import {
	View,
	Text,
	Image,
	TouchableOpacity,
	StyleSheet,
	ActivityIndicator,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSpotifyContext } from '../context/SpotifyContext';
import { Colors, Typography, Spacing } from "../theme";

export default function NowPlayingScreen() {
  const {
		accessToken,
		isLoading: authLoading,
		error: authError,
		login,
		logout,
		track,
		trackLoading,
		trackError,
		lastUpdated,
	} = useSpotifyContext();

  // --- Loading state while we check SecureStore for a stored token ---
  if (authLoading) {
    return (
			<SafeAreaView style={styles.centerContainer}>
				<ActivityIndicator size="large" color={Colors.purple} />
			</SafeAreaView>
		);
  }

  // --- Login screen ---
  if (!accessToken) {
		return (
			<SafeAreaView style={styles.centerContainer}>
				<Image
					source={require("../../assets/logo.png")}
					style={styles.logo}
					resizeMode="contain"
				/>
				<Text style={styles.subtitle}>Share what you're listening to</Text>
				<TouchableOpacity
					style={styles.loginButton}
					onPress={login}
					activeOpacity={0.85}
				>
					<Text style={styles.loginButtonText}>Login with Spotify</Text>
				</TouchableOpacity>
				{authError ? <Text style={styles.error}>{authError}</Text> : null}
			</SafeAreaView>
		);
	}

  // --- Now Playing screen ---
  return (
		<SafeAreaView style={styles.container}>
			{/* Header */}
			<View style={styles.header}>
				<Text style={styles.headerTitle}>Now Playing</Text>
				<TouchableOpacity
					onPress={logout}
					hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
				>
					<Text style={styles.logoutText}>Log out</Text>
				</TouchableOpacity>
			</View>

			{/* Main content area */}
			<View style={styles.content}>
				{trackError ? <Text style={styles.error}>{trackError}</Text> : null}

				{/* Show spinner on the very first load before we have any data */}
				{trackLoading && !track && !lastUpdated ? (
					<ActivityIndicator size="large" color={Colors.purple} />
				) : null}

				{/* Nothing playing state */}
				{!trackLoading && !track && lastUpdated ? (
					<View style={styles.emptyState}>
						<Ionicons name="musical-notes" size={72} color={Colors.grey400} />
						<Text style={styles.emptyHeading}>Nothing playing</Text>
						<Text style={styles.emptyBody}>Open Spotify and start a track</Text>
					</View>
				) : null}

				{/* Track card */}
				{track ? (
					<View style={styles.trackCard}>
						{track.albumArt ? (
							<Image
								source={{ uri: track.albumArt }}
								style={styles.albumArt}
								accessibilityLabel={`Album art for ${track.name}`}
							/>
						) : (
							// Fallback when Spotify returns no image URL
							<View style={[styles.albumArt, styles.albumArtFallback]}>
								<Ionicons
									name="musical-notes"
									size={80}
									color={Colors.grey400}
								/>
							</View>
						)}
						<Text style={styles.trackName} numberOfLines={2}>
							{track.name}
						</Text>
						<Text style={styles.artistName} numberOfLines={1}>
							{track.artist}
						</Text>
						{lastUpdated ? (
							<Text style={styles.timestamp}>
								Updated {lastUpdated.toLocaleTimeString()}
							</Text>
						) : null}
					</View>
				) : null}
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	// Shared between login and now-playing
	centerContainer: {
		flex: 1,
		backgroundColor: Colors.darkBg,
		alignItems: "center",
		justifyContent: "center",
		padding: Spacing.lg,
	},

	// Now-playing layout
	container: {
		flex: 1,
		backgroundColor: Colors.darkBg,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: Spacing.lg,
		paddingTop: Spacing.md,
		paddingBottom: Spacing.sm,
	},
	headerTitle: {
		...Typography.h2,
		color: Colors.white,
	},
	content: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		padding: Spacing.lg,
	},

	// Login screen elements
	logo: {
		width: 220,
		height: 220,
		marginBottom: Spacing.sm,
	},
	subtitle: {
		...Typography.body,
		color: Colors.grey400,
		marginBottom: Spacing.xxl,
	},
	loginButton: {
		backgroundColor: Colors.purple,
		paddingHorizontal: 40,
		paddingVertical: Spacing.md,
		borderRadius: 14,
	},
	loginButtonText: {
		color: Colors.white,
		fontSize: 16,
		fontWeight: "bold",
		letterSpacing: 0.5,
	},

	// Track card
	trackCard: {
		alignItems: "center",
		width: "100%",
	},
	albumArt: {
		width: 260,
		height: 260,
		borderRadius: 8,
		marginBottom: Spacing.lg,
		backgroundColor: Colors.darkSurface, // shown while image loads
	},
	albumArtFallback: {
		alignItems: "center",
		justifyContent: "center",
	},
	trackName: {
		...Typography.h2,
		color: Colors.white,
		textAlign: "center",
		marginBottom: Spacing.sm,
		paddingHorizontal: Spacing.md,
	},
	artistName: {
		...Typography.bodyMed,
		color: Colors.grey400,
		textAlign: "center",
	},
	timestamp: {
		...Typography.tiny,
		color: Colors.grey600,
		marginTop: Spacing.md,
	},

	// Empty state
	emptyState: {
		alignItems: "center",
		gap: Spacing.sm,
	},
	emptyHeading: {
		fontSize: 20,
		fontWeight: "600",
		color: Colors.white,
	},
	emptyBody: {
		...Typography.small,
		color: Colors.grey400,
	},

	// Redirect URI debug panel
	// Shared
	logoutText: {
		color: Colors.grey400,
		fontSize: 14,
	},
	error: {
		color: Colors.pink,
		fontSize: 13,
		textAlign: "center",
		marginTop: Spacing.md,
		paddingHorizontal: Spacing.md,
	},
});
