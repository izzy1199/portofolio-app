document.getElementById("tombol").addEventListener("click", () => {
  alert("Gokss Yekaann");
});

const form = document.getElementById("form-pesan");
const daftar = document.getElementById("daftar-pesan");

async function muatPesan() {
  const res = await fetch("/api/pesan");
  const data = await res.json();
  daftar.innerHTML = "";
  for (const p of data) {
    const li = document.createElement("li");
    li.textContent = `${p.nama}: ${p.isi}`; // textContent mencegah XSS
    daftar.appendChild(li);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  await fetch("/api/pesan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nama: document.getElementById("nama").value,
      isi: document.getElementById("isi").value,
    }),
  });
  form.reset();
  muatPesan();
});

muatPesan();