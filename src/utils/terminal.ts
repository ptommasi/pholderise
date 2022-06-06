import { createInterface } from "readline";

export function yesnoQuestion(text: string): Promise<boolean> {

  return new Promise(resolve => {

    const rl = createInterface(process.stdin, process.stdout);

    rl.question(`${text} [yes]/no: `, function(answer) {
      rl.close();
      if (answer.trim().length === 0) {
        resolve(true);
      }
      const lowered = answer.trim().toLowerCase();
      if(lowered === "yes" || lowered === "y") {
        resolve(true);
      } else {
        resolve(false);
      }
    });

  });

}
