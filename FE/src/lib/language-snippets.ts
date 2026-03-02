export const LANGUAGE_SNIPPETS: Record<string, string> = {
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
  python: `def main():
    print("Hello, World!")

if __name__ == "__main__":
    main()`,
  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
  javascript: `function main() {
    console.log("Hello, World!");
}

main();`,
};
