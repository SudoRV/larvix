export default function BlankPage({ messages, setInput }) {
    return (
        <>
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[96%] text-center space-y-4 text-gray-500 not-branchable">

                    <p className="font-medium text-gray-600 not-branchable">
                        Start a conversation
                    </p>

                    <div className="flex flex-wrap justify-center gap-2 not-branchable">
                        {[
                            "Ask anything",
                            "Summarize topic",
                            "Generate ideas",
                            "backpropagation",
                            "Branch chat"
                        ].map((item) => (
                            <button
                                key={item}
                                onClick={() => setInput(item)}
                                className="
            px-4 py-2 text-sm rounded-full
            bg-white border border-gray-300
            hover:bg-black hover:text-white
            transition not-branchable
          "
                            >
                                {item}
                            </button>
                        ))}
                    </div>

                </div>
            )}</>

    )
}