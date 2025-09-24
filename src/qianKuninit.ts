let instance: any = null;
import { renderWithQiankun } from "vite-plugin-qiankun/dist/helper";
const initQianKun = render => {
  renderWithQiankun({
    mount(props) {
      render(props);
    },
    bootstrap() {},
    update() {},
    unmount() {
      instance.unmount();
      instance._container.innerHTML = "";
      instance = null;
      // history.destroy();
    }
  });
};
export default initQianKun;
