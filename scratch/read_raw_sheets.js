async function fetchRawSheet(sheetName) {
  const url = `https://docs.google.com/spreadsheets/d/1oALlf5FFvojWg78MqcANKlv1AT-6WQk3/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}&t=${Date.now()}`;
  const resp = await fetch(url);
  const text = await resp.text();
  const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);/);
  const json = JSON.parse(match[1]);
  return json.table.rows.map(r => r.c.map(cell => cell ? cell.v : null));
}

async function run() {
  try {
    console.log("Fetching ROTEIRO LUCAS...");
    const lucas = await fetchRawSheet("ROTEIRO LUCAS");
    console.log("Lucas Row 0-5:", lucas.slice(0, 5));
    
    console.log("Fetching ROTEIRO ALEXANDRE...");
    const alexandre = await fetchRawSheet("ROTEIRO ALEXANDRE");
    console.log("Alexandre Row 0-5:", alexandre.slice(0, 5));
  } catch (err) {
    console.error("Error:", err);
  }
}

run();
