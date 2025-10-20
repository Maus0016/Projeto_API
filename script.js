const baseUrl = "https://localhost:7134"
async function get(){
    const res = await fetch(`${baseUrl}/api/Usuario`)
}
get()
async function create(params) {
    const res = await fetch("https://localhost:7134/api/Usuario")
}