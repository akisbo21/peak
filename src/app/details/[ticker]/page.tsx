export default async function Page({params,}: {
    params: Promise<{ ticker: string }>
}) {
    const ticker = (await params).ticker
    return <div id="details-page">My Post: {ticker}</div>
}