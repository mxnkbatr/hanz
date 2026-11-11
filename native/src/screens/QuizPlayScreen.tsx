import { useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { useNavigation, useRoute, type RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PrimaryButton, Txt } from "../components/ui";
import type { Question } from "../data/quiz";
import { hapticError, hapticSuccess } from "../lib/haptics";
import { useReduceMotion } from "../lib/motion";
import type { RootStackParamList } from "../navigation/types";
import { useApp } from "../state/AppState";
import { categoryMeta } from "../theme/tokens";
import { useTheme } from "../theme/Theme";

export function QuizPlayScreen() {
  const route = useRoute<RouteProp<RootStackParamList, "QuizPlay">>();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const { lesson, quiz, loseHeart, completeLesson } = useApp();
  const item = lesson(route.params.lessonId);
  const { theme, type } = useTheme();
  const reduce = useReduceMotion();
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const correctRef = useRef(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);
  const [matched, setMatched] = useState<string[]>([]);
  const [left, setLeft] = useState<string | null>(null);
  const [heard, setHeard] = useState(false);
  const [playing, setPlaying] = useState(false);
  const shake = useSharedValue(0);
  const pop = useSharedValue(1);
  const accent = categoryMeta.quiz;

  const question = item?.questions[index];
  const rights = useMemo(() => {
    if (!question || question.type !== "match") return [] as string[];
    return question.pairs.map((pair) => pair.right);
  }, [question]);

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }, { scale: pop.value }] }));

  if (!item || !question) {
    return (
      <View style={[styles.page, { backgroundColor: theme.bg }]}>
        <Txt>Хичээл олдсонгүй.</Txt>
      </View>
    );
  }

  function finish(nextCorrect: number) {
    const res = completeLesson(item!.id, nextCorrect, item!.questions.length);
    nav.replace("QuizDone", {
      lessonId: item!.id,
      correct: nextCorrect,
      total: item!.questions.length,
      xp: res.xpGained,
      suggested: res.suggested,
    });
  }

  function advance(ok: boolean) {
    const nextCorrect = correctRef.current + (ok ? 1 : 0);
    correctRef.current = nextCorrect;
    setCorrect(nextCorrect);
    if (ok) {
      void hapticSuccess();
      pop.value = withSequence(withSpring(1.04), withSpring(1));
    } else {
      void hapticError();
      shake.value = reduce ? 0 : withSequence(withTiming(-10, { duration: 40 }), withTiming(10, { duration: 40 }), withTiming(0, { duration: 40 }));
      const hearts = loseHeart();
      if (hearts <= 0 && item?.kind !== "placement") {
        setTimeout(() => finish(nextCorrect), 400);
        return;
      }
    }
    setLocked(true);
    setTimeout(() => {
      if (index + 1 >= item!.questions.length) finish(nextCorrect);
      else {
        setIndex((n) => n + 1);
        setPicked(null);
        setLocked(false);
        setMatched([]);
        setLeft(null);
        setHeard(false);
        setPlaying(false);
      }
    }, reduce ? 0 : 420);
  }

  function choose(option: number, answer: number) {
    if (locked) return;
    setPicked(option);
    advance(option === answer);
  }

  function matchRight(right: string) {
    if (!left || !question || question.type !== "match" || locked) return;
    const pair = question.pairs.find((p) => p.left === left);
    if (pair?.right === right) {
      const next = [...matched, left];
      setMatched(next);
      setLeft(null);
      void hapticSuccess();
      if (next.length === question.pairs.length) advance(true);
    } else {
      setLeft(null);
      advance(false);
    }
  }

  const progress = index / item.questions.length;

  return (
    <View style={[styles.page, { backgroundColor: theme.bg, paddingTop: insets.top + 10 }]}>
      <View style={styles.top}>
        <Pressable onPress={() => nav.goBack()}>
          <Txt tone="muted">Гарах</Txt>
        </Pressable>
        <Txt>
          {Array.from({ length: 5 }, (_, i) => (i < quiz.hearts ? "♥" : "♡")).join(" ")}
        </Txt>
      </View>
      <View style={[styles.track, { backgroundColor: theme.line }]}>
        <View style={[styles.fill, { width: `${Math.max(6, progress * 100)}%`, backgroundColor: accent.a }]} />
      </View>
      <Txt tone="label">
        {index + 1} / {item.questions.length} · {item.title}
      </Txt>
      <Animated.View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.line }, shakeStyle]}>
        <QuestionBody
          question={question}
          picked={picked}
          locked={locked}
          onChoose={choose}
          matched={matched}
          left={left}
          setLeft={setLeft}
          rights={rights}
          onRight={matchRight}
          heard={heard}
          playing={playing}
          onPlay={() => {
            setPlaying(true);
            setTimeout(() => {
              setPlaying(false);
              setHeard(true);
            }, reduce ? 0 : 1100);
          }}
        />
      </Animated.View>
    </View>
  );
}

function QuestionBody(props: {
  question: Question;
  picked: number | null;
  locked: boolean;
  onChoose: (option: number, answer: number) => void;
  matched: string[];
  left: string | null;
  setLeft: (v: string | null) => void;
  rights: string[];
  onRight: (right: string) => void;
  heard: boolean;
  playing: boolean;
  onPlay: () => void;
}) {
  const { theme, type } = useTheme();
  const q = props.question;
  if (q.type === "match") {
    return (
      <View style={{ gap: 10 }}>
        <Txt tone="title" style={{ fontSize: 22 }}>
          {q.prompt}
        </Txt>
        {q.pairs.map((pair) => (
          <View key={pair.left} style={styles.matchRow}>
            <Pressable
              disabled={props.matched.includes(pair.left)}
              onPress={() => props.setLeft(pair.left)}
              style={[styles.pair, { borderColor: props.left === pair.left ? theme.seal : theme.line, opacity: props.matched.includes(pair.left) ? 0.4 : 1 }]}
            >
              <Txt style={{ fontFamily: type.bold }}>{pair.left}</Txt>
            </Pressable>
          </View>
        ))}
        <View style={styles.matchRow}>
          {props.rights.map((right) => (
            <Pressable key={right} onPress={() => props.onRight(right)} style={[styles.pair, { borderColor: theme.line, backgroundColor: theme.bg }]}>
              <Txt>{right}</Txt>
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  const options = q.type === "listen" && !props.heard ? [] : q.options;
  const answer = q.correct;
  return (
    <View style={{ gap: 12 }}>
      <Txt tone="title" style={{ fontSize: 22 }}>
        {"prompt" in q ? q.prompt : "Зөв хөг дуудлагыг сонгоно уу"}
      </Txt>
      {"hanzi" in q && q.hanzi ? (
        <Txt tone="zh" style={{ fontSize: 64, lineHeight: 72, textAlign: "center" }}>
          {q.hanzi}
        </Txt>
      ) : null}
      {"pinyin" in q && q.pinyin ? (
        <Txt tone="muted" style={{ textAlign: "center" }}>
          {q.pinyin}
        </Txt>
      ) : null}
      {q.type === "listen" ? (
        <View style={{ gap: 8 }}>
          <View style={styles.wave}>
            {(props.playing ? [18, 34, 22, 40, 16, 30, 20] : [10, 10, 10, 10, 10, 10, 10]).map((h, i) => (
              <View key={i} style={{ width: 6, height: h, borderRadius: 4, backgroundColor: categoryMeta.quiz.a }} />
            ))}
          </View>
          <Txt tone="muted">{q.caption}</Txt>
          {!props.heard ? <PrimaryButton label={props.playing ? "Сонсож байна…" : "Долгион тоглуулах"} colors={[categoryMeta.quiz.a, categoryMeta.quiz.b]} onPress={props.onPlay} /> : null}
        </View>
      ) : null}
      {options.map((option, i) => {
        const on = props.picked === i;
        const good = props.locked && i === answer;
        const bad = props.locked && on && i !== answer;
        return (
          <Pressable
            key={option}
            onPress={() => props.onChoose(i, answer)}
            style={[
              styles.option,
              {
                borderColor: good ? theme.good : bad ? theme.bad : on ? theme.seal : theme.line,
                backgroundColor: good ? "rgba(15,159,110,0.12)" : theme.bg,
              },
            ]}
          >
            <Txt style={{ fontFamily: type.semi }}>{option}</Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 18, gap: 12 },
  top: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  track: { height: 8, borderRadius: 99, overflow: "hidden" },
  fill: { height: 8, borderRadius: 99 },
  card: { borderWidth: 1, borderRadius: 28, padding: 16, gap: 8 },
  option: { borderWidth: 1.5, borderRadius: 16, padding: 14 },
  matchRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pair: { borderWidth: 1.5, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10 },
  wave: { height: 48, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5 },
});
