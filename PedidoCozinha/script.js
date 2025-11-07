const baseUrl = "http://localhost:5042"
const headers = {
    "Content-Type": "application/json"
}
async function get() {
    const res = await fetch(`${baseUrl}/api/PedidoCozinha`)
    const pedidocozinha = await response.json
}