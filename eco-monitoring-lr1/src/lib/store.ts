import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

function readJson<T>(file: string): T {
  const raw = fs.readFileSync(path.join(DATA_DIR, file), "utf-8");
  return JSON.parse(raw) as T;
}

export interface Station {
  id: string;
  name: string;
  city: string;
  lat: number;
  lon: number;
  ownerUserId: string;
  apiKey: string;
  status: string;
}

export interface Measurement {
  stationId: string;
  ts: string;
  pm25: number;
  pm10: number;
  no2: number;
  co: number;
  temp: number;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: string;
  fullName: string;
}

export function getStations(): Station[] {
  return readJson<Station[]>("stations.json");
}

export function getStationById(id: string): Station | undefined {
  return getStations().find((s) => s.id === id);
}

export function getMeasurements(stationId: string): Measurement[] {
  return readJson<Measurement[]>("measurements.json").filter(
    (m) => m.stationId === stationId
  );
}

export function getUsers(): User[] {
  return readJson<User[]>("users.json");
}

export function findUser(username: string): User | undefined {
  return getUsers().find((u) => u.username === username);
}
