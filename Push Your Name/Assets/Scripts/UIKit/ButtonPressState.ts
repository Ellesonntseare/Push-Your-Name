// Press feedback for a UI-kit button: scale, brightness and the shader's drop
// shadow respond while the button is held. It does NOT decide what the tap
// does — hit-test in your manager with APJS.TouchUtils.isScreenPointOnImage.
@component()
export class ButtonPressState extends APJS.BasicScriptComponent {
  @header("Gameplay Tuning")
  @serializeProperty
  @tooltip("Scale while held. 1 = no size change.")
  @slider(0.8, 1, 0.005)
  private pressScale: number = 0.965;

  @serializeProperty
  @tooltip("Brightness while held. 1 = unchanged.")
  @slider(0.5, 1, 0.01)
  private pressBright: number = 0.88;

  @serializeProperty
  @tooltip("Seconds the press and release transition takes.")
  @slider(0.01, 0.4, 0.01)
  private pressSec: number = 0.09;

  @serializeProperty
  @tooltip("Shader shadow distance while released.")
  @slider(0, 32, 0.5)
  private shadowRestDistance: number = 8;

  @serializeProperty
  @tooltip("Shader shadow distance while held. Smaller values feel physically pressed.")
  @slider(0, 16, 0.5)
  private shadowPressDistance: number = 2;

  @serializeProperty
  @tooltip("Shader shadow blur while released.")
  @slider(1, 24, 0.5)
  private shadowRestBlur: number = 6;

  @serializeProperty
  @tooltip("Shader shadow blur while held.")
  @slider(1, 16, 0.5)
  private shadowPressBlur: number = 3;

  private image!: APJS.Image;
  private rect!: APJS.ScreenTransform;
  private baseScale!: APJS.Vector2f;
  private baseColor!: APJS.Color;
  private ready: boolean = false;
  private held: boolean = false;
  private amount: number = 0;

  private touchCallback = (event: APJS.IEvent) => {
    if (!this.ready) return;
    const touch = event.args[0] as APJS.TouchData;
    const inside = APJS.TouchUtils.isScreenPointOnImage(touch.position, this.image);
    if (touch.phase === APJS.TouchPhase.Began) {
      this.held = inside;
    } else if (touch.phase === APJS.TouchPhase.Moved) {
      // Dragging off the button releases it, the way a real button behaves.
      this.held = this.held && inside;
    } else {
      this.held = false;
    }
  };

  onUpdate(dt: number): void {
    if (!this.ready && !this.init()) return;

    const prev = this.amount;
    const step = dt / this.guard(this.pressSec, 0.01, 0.4, 0.09);
    const next = prev + (this.held ? step : -step);
    this.amount = next < 0 ? 0 : next > 1 ? 1 : next;

    const k = this.easeCss(this.amount);
    const restDistance = this.guard(this.shadowRestDistance, 0, 32, 8);
    const pressDistance = this.guard(this.shadowPressDistance, 0, 16, 2);
    const restBlur = this.guard(this.shadowRestBlur, 1, 24, 6);
    const pressBlur = this.guard(this.shadowPressBlur, 1, 16, 3);
    // Per-Image writes: a material shared by several buttons is unaffected.
    this.image.setMaterialProperty("_ShadowDistance", restDistance + (pressDistance - restDistance) * k);
    this.image.setMaterialProperty("_ShadowBlur", restBlur + (pressBlur - restBlur) * k);

    if (this.amount === 0 && prev === 0) {
      // Fully released, so the scene owns the transform and tint again. Re-reading
      // them here lets Inspector edits through instead of pinning stale values.
      this.baseScale = new APJS.Vector2f(this.rect.scale.x, this.rect.scale.y);
      const c = this.image.color;
      this.baseColor = new APJS.Color(c.r, c.g, c.b, c.a);
      return;
    }

    const s = 1 + (this.guard(this.pressScale, 0.8, 1, 0.965) - 1) * k;
    const b = 1 + (this.guard(this.pressBright, 0.5, 1, 0.88) - 1) * k;

    // Scaling the ScreenTransform carries the child label along and shrinks the
    // shader's corner radius, border and shadow with it, matching CSS transform.
    this.rect.scale = new APJS.Vector2f(this.baseScale.x * s, this.baseScale.y * s);
    // The Image tint reaches the shader as u_color, which multiplies the fill only,
    // so the sheen and bevel highlights keep their strength as the fill darkens.
    this.image.color = new APJS.Color(
      this.baseColor.r * b,
      this.baseColor.g * b,
      this.baseColor.b * b,
      this.baseColor.a
    );
  }

  private init(): boolean {
    const obj = this.getSceneObject();
    if (!obj) return false;
    const img = obj.getComponent("Image") as APJS.Image;
    const st = obj.getComponent("ScreenTransform") as APJS.ScreenTransform;
    if (!img || !st) return false;
    this.image = img;
    this.rect = st;
    this.baseScale = new APJS.Vector2f(st.scale.x, st.scale.y);
    this.baseColor = new APJS.Color(img.color.r, img.color.g, img.color.b, img.color.a);
    APJS.EventManager.getGlobalEmitter().on(APJS.EventType.Touch, this.touchCallback);
    this.ready = true;
    return true;
  }

  // CSS `ease` is cubic-bezier(.25,.1,.25,1). Newton-solve x(t) for the elapsed
  // fraction, then read y(t) off the same curve.
  private easeCss(x: number): number {
    const x1 = 0.25;
    const y1 = 0.1;
    const x2 = 0.25;
    const y2 = 1;
    let t = x;
    for (let i = 0; i < 4; i++) {
      const m = 1 - t;
      const d = 3 * m * m * x1 + 6 * m * t * (x2 - x1) + 3 * t * t * (1 - x2);
      if (d < 0.000001) break;
      t -= (3 * m * m * t * x1 + 3 * m * t * t * x2 + t * t * t - x) / d;
    }
    const m = 1 - t;
    return 3 * m * m * t * y1 + 3 * m * t * t * y2 + t * t * t;
  }

  private guard(v: number, lo: number, hi: number, fallback: number): number {
    if (!Number.isFinite(v)) return fallback;
    return v < lo ? lo : v > hi ? hi : v;
  }

  onDestroy(): void {
    APJS.EventManager.getGlobalEmitter().off(APJS.EventType.Touch, this.touchCallback);
  }
}
