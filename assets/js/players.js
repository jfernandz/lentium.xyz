(() => {
  const BASE = "https://maps.lentium.xyz";
  const WORLD = "world";
  const POLL_MS = 2000;

  const listEl = document.getElementById("players-list");
  const countEl = document.getElementById("players-count");
  const statusEl = document.getElementById("players-status");

  if (!listEl || !countEl || !statusEl) {
    return;
  }

  let pollTimer;

  const setStatus = (text) => {
    statusEl.textContent = text;
  };

  const renderPlayers = (players = []) => {
    listEl.innerHTML = "";

    if (players.length === 0) {
      const empty = document.createElement("li");
      empty.className = "list-group-item text-muted";
      empty.textContent = "No players online.";
      listEl.appendChild(empty);
    } else {
      players.forEach((player) => {
        const item = document.createElement("li");
        item.className = "list-group-item d-flex justify-content-between align-items-center";
        item.textContent = player.name ?? "Unknown";

        const meta = document.createElement("span");
        meta.className = "badge text-bg-light text-muted";
        meta.textContent = player.world ?? WORLD;
        item.appendChild(meta);

        listEl.appendChild(item);
      });
    }

    countEl.textContent = String(players.length);
  };

  const poll = async () => {
    try {
      const res = await fetch("/api/players", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`Dynmap request failed (${res.status})`);
      }

      const data = await res.json();
      renderPlayers(data.players || []);

      setStatus(`Last updated: ${new Date().toLocaleTimeString()}`);
    } catch (err) {
      renderPlayers([]);
      countEl.textContent = "--";
      setStatus("Players feed unavailable. Check the /api/players endpoint.");
    } finally {
      pollTimer = window.setTimeout(poll, POLL_MS);
    }
  };

  poll();

  window.addEventListener("beforeunload", () => {
    if (pollTimer) {
      window.clearTimeout(pollTimer);
    }
  });
})();
