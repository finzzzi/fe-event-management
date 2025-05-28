import Link from "next/link";

const Home = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold">EVENTIO</h1>
      <div className="flex flex-col">
        <Link href="/register">Register</Link>
        <Link href="/login">Login</Link>
      </div>
    </div>
  );
};

export default Home;
