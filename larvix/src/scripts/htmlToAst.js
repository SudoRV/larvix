import { unified } from "unified";
import rehypeParse from "rehype-parse";

export default function htmlToAst({ html }) {
    const tree = unified()
        .use(rehypeParse, { fragment: true })
        .parse(html);

    return tree;
}