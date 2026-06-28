import fs from "fs";
import path from "path";
import React from "react";
import {
  Document,
  Image,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

import { ENTRY_CONDITION_LABELS } from "~/server/db/schema";

type Entry = {
  id: number;
  timestamp: Date;
  condition: string;
  description: string | null;
  quantity: number | null;
  unit: string | null;
  calories: number | null;
  estimationStatus: string;
  note: string | null;
  noteType: string | null;
  photoPath1: string | null;
  photoPath2: string | null;
};

const BRAND_ORANGE = "#F05C22";
const BRAND_MARINE = "#06466D";
const PHOTO_COL_WIDTH = 57; // ≈ 2 cm

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 36,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: BRAND_MARINE,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },
  logo: {
    width: 32,
    height: 32,
  },
  title: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: BRAND_ORANGE,
  },
  subtitle: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 28,
  },
  dayHeader: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: BRAND_ORANGE,
    marginTop: 18,
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#fcd9c8",
  },
  entry: {
    marginBottom: 6,
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: 8,
    paddingRight: 8,
    backgroundColor: "#f8fafc",
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  colTime: { width: 40 },
  colContent: { flex: 1, paddingRight: 4 },
  colPhoto: { width: PHOTO_COL_WIDTH },
  time: {
    fontFamily: "Helvetica-Bold",
    color: BRAND_MARINE,
  },
  condition: {
    color: BRAND_MARINE,
    marginBottom: 2,
  },
  description: {
    marginBottom: 2,
    color: BRAND_MARINE,
  },
  metrics: {
    flexDirection: "row",
    marginBottom: 2,
  },
  metricItem: {
    flexDirection: "row",
    marginRight: 20,
    alignItems: "center",
  },
  metricLabel: {
    color: "#6b7280",
    marginRight: 4,
  },
  metricValue: { marginRight: 4 },
  badge: {
    fontSize: 7,
    color: "#ffffff",
    backgroundColor: "#9ca3af",
    paddingTop: 1,
    paddingBottom: 1,
    paddingLeft: 3,
    paddingRight: 3,
  },
  badgeMesure: { backgroundColor: "#059669" },
  note: {
    color: "#4b5563",
    fontFamily: "Helvetica-Oblique",
    marginBottom: 1,
  },
  noteType: {
    fontSize: 8,
    color: BRAND_ORANGE,
    marginBottom: 1,
  },
  thumbnail: {
    width: PHOTO_COL_WIDTH,
    height: PHOTO_COL_WIDTH,
    objectFit: "contain",
    marginBottom: 2,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 8,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 4,
  },
});

function formatTime(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function groupByDay(items: Entry[]): [string, Entry[]][] {
  const map = new Map<string, Entry[]>();
  for (const entry of items) {
    const key = new Date(entry.timestamp).toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const list = map.get(key) ?? [];
    list.push(entry);
    map.set(key, list);
  }
  return Array.from(map.entries());
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function quantityLabel(quantity: number | null, unit: string | null): string {
  if (quantity == null) return "";
  return unit ? `${quantity} ${unit}` : String(quantity);
}

const LOGO_PATH = path.join(process.cwd(), "public", "logo.png");

type RapportPDFProps = {
  entries: Entry[];
  from: Date | null;
  to: Date | null;
};

export function RapportPDF({ entries: items, from, to }: RapportPDFProps) {
  const days = groupByDay(items);
  const hasLogo = fs.existsSync(LOGO_PATH);

  const periodLabel =
    from && to
      ? `Du ${from.toLocaleDateString("fr-FR")} au ${to.toLocaleDateString("fr-FR")}`
      : from
        ? `À partir du ${from.toLocaleDateString("fr-FR")}`
        : to
          ? `Jusqu'au ${to.toLocaleDateString("fr-FR")}`
          : "Historique complet";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          {hasLogo && <Image src={LOGO_PATH} style={styles.logo} />}
          <Text style={styles.title}>Rapport alimentaire PACAL</Text>
        </View>
        <Text style={styles.subtitle}>{periodLabel}</Text>

        {days.map(([day, dayEntries]) => (
          <View key={day}>
            <Text style={styles.dayHeader}>{capitalize(day)}</Text>

            {dayEntries.map((entry) => {
              const isMesure = entry.estimationStatus === "mesure";
              const conditionLabel =
                ENTRY_CONDITION_LABELS[entry.condition as keyof typeof ENTRY_CONDITION_LABELS] ?? entry.condition;
              const qLabel = quantityLabel(entry.quantity, entry.unit);

              const photos = [entry.photoPath1, entry.photoPath2]
                .filter((p): p is string => !!p && fs.existsSync(p));

              return (
                <View key={entry.id} style={styles.entry}>
                  <View style={styles.entryRow}>
                    <View style={styles.colTime}>
                      <Text style={styles.time}>{formatTime(new Date(entry.timestamp))}</Text>
                    </View>

                    <View style={styles.colContent}>
                      <Text style={styles.condition}>{conditionLabel}</Text>
                      {entry.description ? <Text style={styles.description}>{entry.description}</Text> : null}

                      {(qLabel || entry.calories != null) ? (
                        <View style={styles.metrics}>
                          {qLabel ? (
                            <View style={styles.metricItem}>
                              <Text style={styles.metricLabel}>Qté :</Text>
                              <Text style={styles.metricValue}>{qLabel}</Text>
                              <Text style={[styles.badge, isMesure ? styles.badgeMesure : {}]}>
                                {isMesure ? "M" : "E"}
                              </Text>
                            </View>
                          ) : null}
                          {entry.calories != null ? (
                            <View style={styles.metricItem}>
                              <Text style={styles.metricLabel}>Calories :</Text>
                              <Text style={styles.metricValue}>{entry.calories} kcal</Text>
                              <Text style={[styles.badge, isMesure ? styles.badgeMesure : {}]}>
                                {isMesure ? "M" : "E"}
                              </Text>
                            </View>
                          ) : null}
                        </View>
                      ) : null}

                      {entry.noteType ? (
                        <Text style={styles.noteType}>[{entry.noteType}]</Text>
                      ) : null}
                      {entry.note ? <Text style={styles.note}>{entry.note}</Text> : null}
                    </View>

                    <View style={styles.colPhoto}>
                      {photos.map((p, i) => (
                        <Image key={i} src={p} style={styles.thumbnail} />
                      ))}
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ))}

        <Text style={styles.footer}>
          Généré par PACAL le{" "}
          {new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
        </Text>
      </Page>
    </Document>
  );
}

export async function renderRapport(
  items: Entry[],
  from: Date | null,
  to: Date | null
): Promise<Buffer> {
  return renderToBuffer(<RapportPDF entries={items} from={from} to={to} />) as Promise<Buffer>;
}
