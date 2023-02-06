export default WORKFLOW(async (C) => {
const ckpt = C.CheckpointLoaderSimple({ ckpt_name: 'cardosAnimated_v10.safetensors' })
    const vae = C.VAELoader({ vae_name: 'kl-f8-anime.ckpt' })

    // const refPoseImgUpload = await C.uploadImgFromDisk('/home/tekakutli/Pictures/generations/ComfyUI_00088_.png')
   
    let pathimg:string = "/home/tekakutli/Pictures/sab/"
    let pathname:string = "1680262575786088.jpg" 
    //let pathname:string = "1680312559064673.jpg" // crop top
    // let pathname:string = "1680103119232143.png" // sat at bed looking upwards(you)
    // let pathname:string = "1680476182526174.png" // flimsy green dress

    // OLD WAYS, BEFORE WAS
    // const refPoseImgUpload = await C.uploadImgFromDisk(pathimg)
    // const rawPoseImg = C.LoadImage({ image: refPoseImgUpload.name as any })

    const rawPoseImg = C.WASImageLoad({image_path: pathimg+pathname})
    const refPoseImg = C.WASImageCannyFilter ({ image: rawPoseImg, threshold_low: 0, threshold_high: 1, enable_threshold: 'false' })

    // const promptpospre:string = "1girl, pink crop, girl, masterpiece, lewd, slut, hot, absurdres, seductive, beautiful"
    const promptpos = (x:string) => `1girl, ${x} white crop, girl, masterpiece, lewd, slut, hot, absurdres, seductive, beautiful`
    const promptneg:string = "ugly, bad proportions, deformed"
    const txtencode = C.CLIPTextEncode({ text: promptpos('angel'), clip: ckpt })

    const sample = C.KSampler({
        seed: C.randomSeed(),
        steps: 40,
        cfg: 6,
        sampler_name: 'dpmpp_sde',
        // sampler_name: 'uni_pc',
        scheduler: 'normal',
        denoise: 1,
        model: ckpt,
        positive: C.ControlNetApply({
            strength: 1,
            conditioning: txtencode,
            // conditioning: C.CLIPTextEncode({ text: promptpospre, clip: ckpt }),
            control_net: C.DiffControlNetLoader({model: ckpt, control_net_name: 'diff_control_sd15_canny_fp16.safetensors' }),
            image: refPoseImg,
        }),
        negative: C.CLIPTextEncode({ text: promptneg, clip: ckpt }),
        latent_image: C.EmptyLatentImage({ width: 512, height: 512, batch_size: 1 }),
    })

    const upsample = C.LatentUpscale({ samples: sample.LATENT, width: 1024, height: 1024, upscale_method: "nearest-exact", crop: "disabled"  })
        
    const sample2 = C.KSampler({
            seed: C.randomSeed(),
            steps: 15,
            cfg: 7,
            sampler_name: 'dpmpp_sde',
            // sampler_name: 'uni_pc',
            scheduler: 'normal',
            denoise: 1,
            model: ckpt,
            positive: C.ControlNetApply({
                strength: 1,
                conditioning: txtencode,
                // conditioning: C.CLIPTextEncode({ text: promptpospre, clip: ckpt }),
                control_net: C.DiffControlNetLoader({model: ckpt, control_net_name: 'diff_control_sd15_canny_fp16.safetensors' }),
                image: refPoseImg,
            }),
            negative: C.CLIPTextEncode({ text: promptneg, clip: ckpt }),
            latent_image: upsample,
        })

    let pathoutput:string = "/home/tekakutli/Pictures/generations"
    const decoded = C.VAEDecode({ samples: sample2.LATENT, vae: vae.VAE })

    C.WASImageSave({images:decoded, output_path: pathoutput, filename_prefix: "ComfyUi", extension: "png", quality: 100, overwrite_mode: 'false'})

    //C.SaveImage({
    //    filename_prefix: 'ComfyUI',
    //    images: decoded
    //})

    await C.get()

        
    for (const item of ['secretary', 'nurse', 'teacher', 'witch']) {
        // C.print('>' + item)
        txtencode.inputs.text = promptpos(`(${item}:1.3)`)
        await C.get()
    }
    // await C.get()
})
