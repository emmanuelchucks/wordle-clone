import * as Clipboard from "expo-clipboard";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Keyboard from "./components/Keyboard";
import { CLEAR, colors, colorsToEmoji, ENTER } from "./lib/utils";
import words from "./lib/words";

const getWord = () => words[Math.floor(Math.random() * words.length)];
const NUMBER_OF_TRIES = 6;
const copyArray = (arr: string[][]) => [...arr.map((item) => [...item])];

function App() {
  const [word, setWord] = useState(getWord());
  const letters = word.split("");
  const cells = letters.map((_) => "");

  const emptyRows = new Array(NUMBER_OF_TRIES).fill("").map((_) => cells);

  const [rows, setRows] = useState(emptyRows);
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCell, setCurrentCell] = useState(0);
  const [gameState, setGameState] = useState<"won" | "lost" | "playing">(
    "playing"
  );

  const handlePress = (key: string) => {
    if (gameState !== "playing") return;

    const newRows = copyArray(rows);

    if (key === CLEAR) {
      const previousCell = currentCell - 1;

      if (previousCell < 0) return;

      newRows[currentRow][previousCell] = "";
      setRows(newRows);
      setCurrentCell(previousCell);

      return;
    }

    if (key === ENTER) {
      if (currentCell < letters.length) return;

      setCurrentRow(currentRow + 1);
      setCurrentCell(0);

      return;
    }

    if (currentCell < newRows[currentRow].length) {
      newRows[currentRow][currentCell] = key;
      setRows(newRows);
      setCurrentCell(currentCell + 1);
    }
  };

  const isActiveCell = (row: number, cell: number) => {
    return row === currentRow && cell === currentCell;
  };

  const getCellBGColor = (row: number, cell: number) => {
    const letter = rows[row][cell];

    if (row >= currentRow) return colors.black;

    if (letter === letters[cell]) {
      return colors.primary;
    }

    if (letters.includes(letter)) {
      return colors.secondary;
    }

    return colors.darkgrey;
  };

  const getAllLettersWithColor = (color: string) => {
    return rows.flatMap((row, rowIndex) =>
      row.filter(
        (_, cellIndex) => getCellBGColor(rowIndex, cellIndex) === color
      )
    );
  };

  const greenCaps = getAllLettersWithColor(colors.primary);
  const yellowCaps = getAllLettersWithColor(colors.secondary);
  const greyCaps = getAllLettersWithColor(colors.darkgrey);

  useEffect(() => {
    if (currentRow) checkGameStatus();
  }, [currentRow]);

  const checkGameStatus = () => {
    const previousRow = rows[currentRow - 1];

    if (previousRow.every((letter, i) => letter === letters[i])) {
      Alert.alert("Hurray", "🎉 You won!", [
        { text: "Share", onPress: shareScore },
      ]);
      setGameState("won");
    } else if (currentRow === NUMBER_OF_TRIES) {
      Alert.alert(
        "Game Over",
        `The word is ${word.toUpperCase()}. 😢 Try again?`
      );
      setGameState("lost");
    }
  };

  const shareScore = () => {
    const textToShare = rows
      .map((row, rowIndex) =>
        row
          .map(
            (_, cellIndex) => colorsToEmoji[getCellBGColor(rowIndex, cellIndex)]
          )
          .join("")
      )
      .filter((row) => row)
      .join("\n");

    Clipboard.setString(textToShare);
    Alert.alert(
      "Copied to clipboard!",
      "You can now share your score on social media."
    );
  };

  const restartGame = () => {
    setWord(getWord());
    setRows(emptyRows);
    setCurrentRow(0);
    setCurrentCell(0);
    setGameState("playing");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      <Text style={styles.title}>WORDLE</Text>

      <ScrollView style={styles.map}>
        {rows.map((row, rowIndex) => (
          <View key={`row-${rowIndex}`} style={styles.row}>
            {row.map((letter, cellIndex) => (
              <View
                key={`cell-${cellIndex}-${rowIndex}`}
                style={[
                  styles.cell,
                  {
                    borderColor: isActiveCell(rowIndex, cellIndex)
                      ? colors.grey
                      : colors.darkgrey,
                    backgroundColor: getCellBGColor(rowIndex, cellIndex),
                  },
                ]}
              >
                <Text style={styles.cellText}>{letter}</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>

      {gameState !== "playing" && (
        <Pressable style={styles.restartButton} onPress={restartGame}>
          <Text style={styles.restartButtonText}>Restart</Text>
        </Pressable>
      )}

      <Pressable
        onPress={() => Linking.openURL("https://www.emmanuelchucks.com")}
        style={styles.credit}
      >
        <Text style={styles.creditText}>by Papi</Text>
      </Pressable>

      <Keyboard
        onKeyPressed={handlePress}
        greenCaps={greenCaps}
        yellowCaps={yellowCaps}
        greyCaps={greyCaps}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
    alignItems: "center",
  },

  title: {
    color: colors.lightgrey,
    fontSize: 32,
    fontWeight: "bold",
    letterSpacing: 7,
    marginTop: 10,
  },

  map: {
    alignSelf: "stretch",
    marginVertical: 20,
  },

  row: {
    alignSelf: "stretch",
    flexDirection: "row",
    justifyContent: "center",
  },

  cell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    maxWidth: 50,
    aspectRatio: 1,
    margin: 5,
    borderWidth: 3,
    borderColor: colors.darkgrey,
  },

  cellText: {
    color: colors.lightgrey,
    fontSize: 20,
    fontWeight: "bold",
    textTransform: "uppercase",
  },

  restartButton: {
    alignSelf: "center",
    marginVertical: 40,
  },

  restartButtonText: {
    backgroundColor: colors.secondary,
    color: colors.lightgrey,
    paddingVertical: 10,
    paddingHorizontal: 20,
    fontSize: 20,
    fontWeight: "bold",
  },

  credit: {
    alignSelf: "center",
    justifyContent: "flex-end",
    marginBottom: 20,
  },

  creditText: {
    color: colors.lightgrey,
    fontSize: 12,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

export default App;
